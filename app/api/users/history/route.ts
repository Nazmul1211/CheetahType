import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// GET /api/users/history - get user test history with pagination
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const mode = url.searchParams.get('mode'); // filter by test mode
    const timeLimit = url.searchParams.get('timeLimit'); // filter by time limit

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Get user ID first
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Build query with filters
    let query = supabaseAdmin
      .from('typing_tests')
      .select('*')
      .eq('user_id', user.id);

    if (mode && mode !== 'all') {
      query = query.eq('test_mode', mode);
    }

    if (timeLimit && timeLimit !== 'all') {
      query = query.eq('time_limit', parseInt(timeLimit));
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('typing_tests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error counting tests:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Get paginated results
    const offset = (page - 1) * limit;
    const { data: tests, error: testsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (testsError) {
      console.error('Error fetching user test history:', testsError);
      return NextResponse.json({ error: testsError.message }, { status: 500 });
    }

    // Calculate pagination info
    const totalTests = count || 0;
    const totalPages = Math.ceil(totalTests / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Format test data
    const formattedTests = tests?.map(test => ({
      id: test.id,
      wpm: test.wpm,
      accuracy: Math.round(test.accuracy * 100) / 100,
      consistency: test.consistency ? Math.round(test.consistency * 100) / 100 : null,
      test_mode: test.test_mode,
      time_limit: test.time_limit,
      word_limit: test.word_limit,
      language: test.language,
      actual_duration: test.actual_duration,
      total_characters: test.total_characters,
      correct_characters: test.correct_characters,
      incorrect_characters: test.incorrect_characters,
      total_words: test.total_words,
      correct_words: test.correct_words,
      incorrect_words: test.incorrect_words,
      created_at: test.created_at,
      // Calculate additional metrics
      raw_wpm: Math.round((test.total_characters / 5) / (test.actual_duration / 60)),
      error_rate: Math.round((test.incorrect_characters / test.total_characters) * 100 * 100) / 100
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        tests: formattedTests,
        pagination: {
          currentPage: page,
          totalPages,
          totalTests,
          limit,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          mode: mode || 'all',
          timeLimit: timeLimit || 'all'
        }
      }
    });

  } catch (e: any) {
    console.error('Error fetching user test history:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch test history' }, { status: 500 });
  }
}
