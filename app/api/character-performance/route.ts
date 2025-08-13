import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// POST /api/character-performance - save detailed character performance data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firebase_uid,
      test_id,
      character_performance
    } = body || {};

    if (!firebase_uid || !test_id || !character_performance) {
      return NextResponse.json({ 
        error: 'Missing required fields: firebase_uid, test_id, character_performance' 
      }, { status: 400 });
    }

    // Get user ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process character performance data
    const performanceEntries = Object.entries(character_performance).map(([char, data]: [string, any]) => ({
      user_id: user.id,
      test_id,
      character: char,
      total_typed: data.total_typed || 0,
      correct_typed: data.correct_typed || 0,
      incorrect_typed: data.incorrect_typed || 0,
      average_speed: data.average_speed || 0,
      error_rate: data.error_rate || 0,
      difficulty_score: data.difficulty_score || 0
    }));

    // Insert character performance data
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('character_performance')
      .insert(performanceEntries)
      .select('*');

    if (insertError) {
      console.error('Error inserting character performance:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save character performance: ' + insertError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: insertData 
    });

  } catch (e: any) {
    console.error('Character performance API error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to save character performance' }, { status: 500 });
  }
}

// GET /api/character-performance - get character performance analytics
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');
    const character = url.searchParams.get('character');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    // Get user ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = supabaseAdmin
      .from('character_performance')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (character) {
      query = query.eq('character', character);
    }

    const { data: performanceData, error } = await query;

    if (error) {
      console.error('Error fetching character performance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate aggregated statistics
    const analytics = calculateCharacterAnalytics(performanceData || []);

    return NextResponse.json({ 
      success: true, 
      data: performanceData || [],
      analytics
    });

  } catch (e: any) {
    console.error('Error fetching character performance:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch character performance' }, { status: 500 });
  }
}

function calculateCharacterAnalytics(performanceData: any[]) {
  const characterStats: Record<string, any> = {};

  performanceData.forEach(entry => {
    const char = entry.character;
    if (!characterStats[char]) {
      characterStats[char] = {
        character: char,
        total_typed: 0,
        correct_typed: 0,
        incorrect_typed: 0,
        total_speed: 0,
        total_tests: 0,
        error_rates: [],
        difficulty_scores: []
      };
    }

    const stats = characterStats[char];
    stats.total_typed += entry.total_typed;
    stats.correct_typed += entry.correct_typed;
    stats.incorrect_typed += entry.incorrect_typed;
    stats.total_speed += entry.average_speed;
    stats.total_tests += 1;
    stats.error_rates.push(entry.error_rate);
    stats.difficulty_scores.push(entry.difficulty_score);
  });

  // Calculate final analytics for each character
  const analytics = Object.values(characterStats).map((stats: any) => {
    const accuracy = stats.total_typed > 0 ? (stats.correct_typed / stats.total_typed) * 100 : 0;
    const avgSpeed = stats.total_tests > 0 ? stats.total_speed / stats.total_tests : 0;
    const avgErrorRate = stats.error_rates.length > 0 ? 
      stats.error_rates.reduce((a: number, b: number) => a + b, 0) / stats.error_rates.length : 0;
    const avgDifficulty = stats.difficulty_scores.length > 0 ? 
      stats.difficulty_scores.reduce((a: number, b: number) => a + b, 0) / stats.difficulty_scores.length : 0;

    return {
      character: stats.character,
      total_typed: stats.total_typed,
      accuracy: Math.round(accuracy * 100) / 100,
      average_speed: Math.round(avgSpeed * 100) / 100,
      error_rate: Math.round(avgErrorRate * 100) / 100,
      difficulty_score: Math.round(avgDifficulty * 100) / 100,
      weakness_score: calculateWeaknessScore(accuracy, avgSpeed, avgErrorRate)
    };
  });

  // Sort by weakness score (highest first)
  analytics.sort((a, b) => b.weakness_score - a.weakness_score);

  return analytics;
}

function calculateWeaknessScore(accuracy: number, speed: number, errorRate: number): number {
  // Weakness score: higher values indicate more need for practice
  // Factors: low accuracy (weight: 40%), high error rate (weight: 40%), low speed (weight: 20%)
  const accuracyComponent = (100 - accuracy) * 0.4;
  const errorComponent = errorRate * 0.4;
  const speedComponent = Math.max(0, (50 - speed)) * 0.2; // Normalize speed (50 CPM as baseline)
  
  return Math.round((accuracyComponent + errorComponent + speedComponent) * 100) / 100;
}
