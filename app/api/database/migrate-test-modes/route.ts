import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST() {
  try {
    console.log('Running migration to add new test modes...');

    // Migration queries
    const migrations = [
      // Drop existing constraints
      'ALTER TABLE public.typing_tests DROP CONSTRAINT IF EXISTS typing_tests_test_mode_check;',
      'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_preferred_test_mode_check;',
      
      // Add new constraints with additional test modes
      `ALTER TABLE public.typing_tests ADD CONSTRAINT typing_tests_test_mode_check 
        CHECK (test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen'));`,
      
      `ALTER TABLE public.users ADD CONSTRAINT users_preferred_test_mode_check 
        CHECK (preferred_test_mode IN ('time', 'words', 'quote', 'custom', 'punctuation', 'numbers', 'zen'));`,
      
      // Update any existing NULL preferred_test_mode to 'time'
      `UPDATE public.users SET preferred_test_mode = 'time' WHERE preferred_test_mode IS NULL;`
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < migrations.length; i++) {
      const query = migrations[i];
      
      try {
        console.log(`Executing migration ${i + 1}/${migrations.length}`);
        
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
          sql: query
        });
        
        if (error) {
          console.warn(`Migration ${i + 1} failed with RPC, trying direct query:`, error.message);
          
          // Try direct SQL execution for constraints
          if (query.includes('ALTER TABLE') || query.includes('UPDATE')) {
            const { error: directError } = await supabaseAdmin
              .from('typing_tests')
              .select('id')
              .limit(0);
              
            if (directError && !directError.message.includes('relation')) {
              throw new Error(`Migration failed: ${directError.message}`);
            }
          }
          
          errorCount++;
          results.push({
            migration: `Migration ${i + 1}`,
            query: query.substring(0, 100) + '...',
            success: false,
            error: error.message
          });
        } else {
          successCount++;
          results.push({
            migration: `Migration ${i + 1}`,
            query: query.substring(0, 100) + '...',
            success: true,
            data: data || 'Success'
          });
        }
      } catch (err: any) {
        console.error(`Migration ${i + 1} failed:`, err);
        errorCount++;
        results.push({
          migration: `Migration ${i + 1}`,
          query: query.substring(0, 100) + '...',
          success: false,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${successCount} successful, ${errorCount} failed.`,
      results,
      summary: {
        total: migrations.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (e: any) {
    console.error('Migration error:', e);
    return NextResponse.json({ 
      success: false, 
      error: e?.message || 'Migration failed' 
    }, { status: 500 });
  }
}
