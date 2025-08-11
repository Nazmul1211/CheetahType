import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'time';
    const timeLimit = url.searchParams.get('time_limit') || '30';
    const limit = Number(url.searchParams.get('limit') || '50');
    const period = url.searchParams.get('period') || '30d'; // 7d, 30d, all

    // Calculate date filter based on period
    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = "tt.created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "tt.created_at >= NOW() - INTERVAL '30 days'";
        break;
      case 'all':
        dateFilter = '1=1'; // No date filter
        break;
      default:
        dateFilter = "tt.created_at >= NOW() - INTERVAL '30 days'";
    }

    let query = supabaseAdmin
      .from('typing_tests')
      .select(`
        id,
        wpm,
        raw_wpm,
        accuracy,
        consistency,
        test_mode,
        time_limit,
        word_limit,
        total_characters,
        actual_duration,
        created_at,
        users!inner(
          firebase_uid,
          display_name,
          email
        )
      `)
      .eq('test_mode', mode)
      .order('wpm', { ascending: false })
      .order('accuracy', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    // Add time limit filter for time mode
    if (mode === 'time' && timeLimit) {
      query = query.eq('time_limit', parseInt(timeLimit));
    }

    // Add date filter if not 'all'
    if (period !== 'all') {
      const days = period === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to match expected format
    const entries = (data || []).map((test: any, index) => {
      const user = Array.isArray(test.users) ? test.users[0] : test.users;
      return {
        id: test.id,
        user_id: user?.firebase_uid,
        username: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
        display_name: user?.display_name,
        wpm: test.wpm,
        raw_wpm: test.raw_wpm,
        accuracy: test.accuracy,
        consistency: test.consistency,
        characters: test.total_characters,
        errors: test.total_characters - Math.round(test.total_characters * (test.accuracy / 100)),
        test_type: 'standard',
        test_mode: test.test_mode,
        time_limit: test.time_limit,
        word_limit: test.word_limit,
        actual_duration: test.actual_duration,
        created_at: test.created_at,
        rank: index + 1
      };
    });

    return NextResponse.json({ 
      success: true,
      entries,
      count: entries.length,
      filters: {
        mode,
        time_limit: timeLimit,
        period,
        limit
      }
    });

  } catch (e: any) {
    console.error('Leaderboard API error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}


