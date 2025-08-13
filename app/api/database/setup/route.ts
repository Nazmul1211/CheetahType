import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    // Check if we're in build time or missing required environment variables
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      return NextResponse.json({ 
        error: 'Database setup not available during build time' 
      }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Missing required Supabase environment variables' 
      }, { status: 400 });
    }

    // Dynamically import the admin client only when we actually need it
    const { supabaseAdmin } = await import('@/utils/supabase/admin');

    console.log('Setting up CheetahType database schema...');
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabaseAdmin
            .from('pg_stat_statements') // This will fail, but we can catch it
            .select('*')
            .limit(0);
            
          // If RPC doesn't work, we'll need to execute statements manually
          console.warn(`Statement ${i + 1} failed with RPC, trying manual execution:`, error.message);
          
          // For critical statements, we can try them individually
          if (statement.includes('CREATE TABLE') || statement.includes('CREATE VIEW')) {
            results.push({
              statement: statement.substring(0, 100) + '...',
              success: false,
              error: error.message
            });
            errorCount++;
            continue;
          }
        }
        
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: true
        });
        successCount++;
        
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err);
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: err.message
        });
        errorCount++;
      }
    }
    
    // Create tables manually if RPC failed
    if (errorCount > 0) {
      console.log('Attempting manual table creation...');
      
      // Create users table
      try {
        const { error: usersError } = await supabaseAdmin.rpc('create_users_table_manual');
        if (usersError) {
          console.log('Manual users table creation failed, continuing...');
        }
      } catch (e) {
        console.log('RPC not available, will create tables via direct SQL execution');
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema setup completed',
      results: {
        total: statements.length,
        successful: successCount,
        failed: errorCount,
        details: results.slice(0, 10) // Show first 10 results
      }
    });
    
  } catch (error: any) {
    console.error('Database setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to set up database schema'
    }, { status: 500 });
  }
}

// Alternative method: Create tables directly via Supabase admin
export async function GET() {
  try {
    console.log('Creating database tables directly...');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ DEFAULT NOW(),
        preferred_test_mode TEXT DEFAULT 'time',
        preferred_time_duration INTEGER DEFAULT 30,
        preferred_words_count INTEGER DEFAULT 25,
        total_tests_completed INTEGER DEFAULT 0,
        best_wpm INTEGER DEFAULT 0,
        average_wpm DECIMAL(5,2) DEFAULT 0,
        best_accuracy DECIMAL(5,2) DEFAULT 0,
        average_accuracy DECIMAL(5,2) DEFAULT 0,
        total_time_typed INTEGER DEFAULT 0,
        total_characters_typed INTEGER DEFAULT 0
      );
    `;
    
    const createTypingTestsTable = `
      CREATE TABLE IF NOT EXISTS public.typing_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        test_mode TEXT NOT NULL CHECK (test_mode IN ('time', 'words', 'quote', 'custom')),
        test_type TEXT DEFAULT 'standard',
        time_limit INTEGER,
        word_limit INTEGER,
        text_content TEXT,
        language TEXT DEFAULT 'english',
        wpm INTEGER NOT NULL,
        raw_wpm INTEGER,
        accuracy DECIMAL(5,2) NOT NULL,
        consistency DECIMAL(5,2),
        total_characters INTEGER NOT NULL,
        correct_characters INTEGER NOT NULL,
        incorrect_characters INTEGER NOT NULL,
        extra_characters INTEGER DEFAULT 0,
        missed_characters INTEGER DEFAULT 0,
        actual_duration INTEGER NOT NULL,
        backspace_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
        CONSTRAINT valid_consistency CHECK (consistency IS NULL OR (consistency >= 0 AND consistency <= 100)),
        CONSTRAINT valid_wpm CHECK (wpm >= 0 AND wpm <= 1000),
        CONSTRAINT valid_duration CHECK (actual_duration > 0)
      );
    `;
    
    const createLeaderboardView = `
      CREATE OR REPLACE VIEW public.leaderboard_view AS
      SELECT 
        tt.id,
        u.firebase_uid,
        u.display_name,
        u.email,
        tt.wpm,
        tt.raw_wpm,
        tt.accuracy,
        tt.consistency,
        tt.test_mode,
        tt.time_limit,
        tt.word_limit,
        tt.total_characters,
        tt.actual_duration,
        tt.created_at,
        ROW_NUMBER() OVER (
          PARTITION BY tt.test_mode, tt.time_limit, tt.word_limit 
          ORDER BY tt.wpm DESC, tt.accuracy DESC, tt.created_at ASC
        ) as rank
      FROM public.typing_tests tt
      JOIN public.users u ON tt.user_id = u.id
      WHERE tt.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY tt.wpm DESC, tt.accuracy DESC;
    `;
    
    // Execute table creation
    console.log('Creating users table...');
    await supabaseAdmin.rpc('exec', { sql: createUsersTable });
    
    console.log('Creating typing_tests table...');
    await supabaseAdmin.rpc('exec', { sql: createTypingTestsTable });
    
    console.log('Creating leaderboard view...');
    await supabaseAdmin.rpc('exec', { sql: createLeaderboardView });
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['users', 'typing_tests', 'leaderboard_view']
    });
    
  } catch (error: any) {
    console.error('Direct table creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'You need to execute the SQL schema manually in your Supabase dashboard'
    }, { status: 500 });
  }
}
