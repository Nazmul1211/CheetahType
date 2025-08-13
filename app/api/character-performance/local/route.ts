import { NextResponse } from 'next/server';

// Simple in-memory storage for character performance (for dashboard analytics only)
// This doesn't persist to database unless user specifically saves a test result
let characterPerformanceData: { [userId: string]: any } = {};

// POST /api/character-performance/local - save character performance data locally
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firebase_uid,
      character_performance
    } = body || {};

    if (!firebase_uid || !character_performance) {
      return NextResponse.json({ 
        error: 'Missing required fields: firebase_uid, character_performance' 
      }, { status: 400 });
    }

    // Store in memory for this session
    characterPerformanceData[firebase_uid] = character_performance;

    return NextResponse.json({ 
      success: true, 
      message: 'Character performance stored locally for dashboard analytics'
    });

  } catch (e: any) {
    console.error('Local character performance API error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to save character performance locally' }, { status: 500 });
  }
}

// GET /api/character-performance/local - get locally stored character performance data
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const firebase_uid = url.searchParams.get('firebase_uid');

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Missing firebase_uid parameter' }, { status: 400 });
    }

    const data = characterPerformanceData[firebase_uid] || {};
    
    // Calculate analytics from the stored data
    const analytics = calculateCharacterAnalytics(data);

    return NextResponse.json({ 
      success: true, 
      data: data,
      analytics
    });

  } catch (e: any) {
    console.error('Error fetching local character performance:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch character performance' }, { status: 500 });
  }
}

function calculateCharacterAnalytics(characterData: any) {
  if (!characterData || Object.keys(characterData).length === 0) {
    return [];
  }

  // Process character performance data
  const analytics = Object.entries(characterData).map(([char, data]: [string, any]) => {
    const accuracy = data.total_typed > 0 ? (data.correct_typed / data.total_typed) * 100 : 0;
    const avgSpeed = data.speeds && data.speeds.length > 0 
      ? data.speeds.reduce((sum: number, speed: number) => sum + speed, 0) / data.speeds.length 
      : 0;
    const errorRate = data.total_typed > 0 ? (data.incorrect_typed / data.total_typed) * 100 : 0;

    return {
      character: char,
      total_typed: data.total_typed || 0,
      accuracy: Math.round(accuracy * 100) / 100,
      average_speed: Math.round(avgSpeed * 100) / 100,
      error_rate: Math.round(errorRate * 100) / 100,
      difficulty_score: Math.round((data.difficulty_score || 0) * 100) / 100,
      weakness_score: calculateWeaknessScore(accuracy, avgSpeed, errorRate)
    };
  });

  // Sort by weakness score (highest first)
  analytics.sort((a, b) => b.weakness_score - a.weakness_score);

  return analytics;
}

function calculateWeaknessScore(accuracy: number, speed: number, errorRate: number): number {
  // Weakness score: higher values indicate more need for practice
  const accuracyComponent = (100 - accuracy) * 0.4;
  const errorComponent = errorRate * 0.4;
  const speedComponent = Math.max(0, (50 - speed)) * 0.2; // Normalize speed (50 CPM as baseline)
  
  return Math.round((accuracyComponent + errorComponent + speedComponent) * 100) / 100;
}
