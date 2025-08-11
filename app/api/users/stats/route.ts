import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// GET /api/users/stats - get user statistics
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Get user basic info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Get detailed statistics from tests
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('typing_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (testsError) {
      console.error('Error fetching user tests:', testsError);
      return NextResponse.json({ error: testsError.message }, { status: 500 });
    }

    // Calculate statistics
    const totalTests = tests?.length || 0;
    
    let stats = {
      totalTests,
      averageWpm: 0,
      bestWpm: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      averageConsistency: 0,
      bestConsistency: 0,
      totalTimeSpent: 0,
      totalCharactersTyped: 0,
      recentTests: [] as any[],
      wpmProgress: [] as any[], // For charts
      accuracyProgress: [] as any[], // For charts
      testsByMode: {} as { [key: string]: any },
      testsByTimeLimit: {} as { [key: string]: any }
    };

    if (totalTests > 0 && tests) {
      // Basic statistics
      stats.averageWpm = Math.round(tests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
      stats.bestWpm = Math.max(...tests.map(test => test.wpm));
      stats.averageAccuracy = Math.round((tests.reduce((sum, test) => sum + test.accuracy, 0) / totalTests) * 100) / 100;
      stats.bestAccuracy = Math.max(...tests.map(test => test.accuracy));
      
      const consistencyValues = tests.filter(test => test.consistency !== null).map(test => test.consistency);
      if (consistencyValues.length > 0) {
        stats.averageConsistency = Math.round((consistencyValues.reduce((sum, val) => sum + val, 0) / consistencyValues.length) * 100) / 100;
        stats.bestConsistency = Math.max(...consistencyValues);
      }

      stats.totalTimeSpent = tests.reduce((sum, test) => sum + test.actual_duration, 0);
      stats.totalCharactersTyped = tests.reduce((sum, test) => sum + test.total_characters, 0);

      // Recent tests (last 10)
      stats.recentTests = tests.slice(0, 10).map(test => ({
        id: test.id,
        wpm: test.wpm,
        accuracy: test.accuracy,
        consistency: test.consistency,
        test_mode: test.test_mode,
        time_limit: test.time_limit,
        word_limit: test.word_limit,
        actual_duration: test.actual_duration,
        created_at: test.created_at
      }));

      // Progress data for charts (last 30 tests)
      const recentForProgress = tests.slice(0, 30).reverse();
      stats.wpmProgress = recentForProgress.map((test, index) => ({
        test: index + 1,
        wpm: test.wpm,
        date: test.created_at
      }));
      stats.accuracyProgress = recentForProgress.map((test, index) => ({
        test: index + 1,
        accuracy: test.accuracy,
        date: test.created_at
      }));

      // Tests by mode
      stats.testsByMode = tests.reduce((acc: any, test) => {
        const mode = test.test_mode;
        if (!acc[mode]) {
          acc[mode] = {
            count: 0,
            averageWpm: 0,
            bestWpm: 0,
            averageAccuracy: 0,
            bestAccuracy: 0
          };
        }
        acc[mode].count++;
        acc[mode].bestWpm = Math.max(acc[mode].bestWpm, test.wpm);
        acc[mode].bestAccuracy = Math.max(acc[mode].bestAccuracy, test.accuracy);
        return acc;
      }, {});

      // Calculate averages for each mode
      Object.keys(stats.testsByMode).forEach(mode => {
        const modeTests = tests.filter(test => test.test_mode === mode);
        stats.testsByMode[mode].averageWpm = Math.round(
          modeTests.reduce((sum, test) => sum + test.wpm, 0) / modeTests.length
        );
        stats.testsByMode[mode].averageAccuracy = Math.round(
          (modeTests.reduce((sum, test) => sum + test.accuracy, 0) / modeTests.length) * 100
        ) / 100;
      });

      // Tests by time limit (for time mode)
      const timeTests = tests.filter(test => test.test_mode === 'time' && test.time_limit);
      stats.testsByTimeLimit = timeTests.reduce((acc: any, test) => {
        const timeLimit = test.time_limit;
        if (!acc[timeLimit]) {
          acc[timeLimit] = {
            count: 0,
            averageWpm: 0,
            bestWpm: 0,
            averageAccuracy: 0,
            bestAccuracy: 0
          };
        }
        acc[timeLimit].count++;
        acc[timeLimit].bestWpm = Math.max(acc[timeLimit].bestWpm, test.wpm);
        acc[timeLimit].bestAccuracy = Math.max(acc[timeLimit].bestAccuracy, test.accuracy);
        return acc;
      }, {});

      // Calculate averages for each time limit
      Object.keys(stats.testsByTimeLimit).forEach(timeLimit => {
        const timeLimitTests = timeTests.filter(test => test.time_limit === parseInt(timeLimit));
        stats.testsByTimeLimit[timeLimit].averageWpm = Math.round(
          timeLimitTests.reduce((sum, test) => sum + test.wpm, 0) / timeLimitTests.length
        );
        stats.testsByTimeLimit[timeLimit].averageAccuracy = Math.round(
          (timeLimitTests.reduce((sum, test) => sum + test.accuracy, 0) / timeLimitTests.length) * 100
        ) / 100;
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        display_name: user.display_name,
        photo_url: user.photo_url,
        created_at: user.created_at,
        last_login_at: user.last_login_at
      },
      stats
    });

  } catch (e: any) {
    console.error('Error fetching user stats:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch user stats' }, { status: 500 });
  }
}
