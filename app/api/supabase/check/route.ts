import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET() {
  try {
    // Check connection to Supabase
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: connectionError.message 
      }, { status: 500 });
    }

    // Check if required tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'tests', 'typing_results']);

    if (tablesError) {
      return NextResponse.json({ 
        error: 'Failed to check tables', 
        details: tablesError.message 
      }, { status: 500 });
    }

    const existingTables = tables?.map(t => t.tablename) || [];

    // Check table structures
    const tablesInfo: Record<string, any> = {};
    
    for (const tableName of ['users', 'tests', 'typing_results']) {
      if (existingTables.includes(tableName)) {
        const { data: columns, error: columnsError } = await supabaseAdmin
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);

        if (!columnsError) {
          tablesInfo[tableName] = columns;
        }
      } else {
        tablesInfo[tableName] = 'Table does not exist';
      }
    }

    // Check if the view exists
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('pg_views')
      .select('viewname')
      .eq('schemaname', 'public')
      .eq('viewname', 'tests_view_leaderboard');

    if (!viewsError) {
      tablesInfo['tests_view_leaderboard'] = views?.length > 0 ? 'View exists' : 'View does not exist';
    }

    return NextResponse.json({
      success: true,
      connection: 'OK',
      existingTables,
      tablesInfo
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Database check failed', 
      details: error.message 
    }, { status: 500 });
  }
}
