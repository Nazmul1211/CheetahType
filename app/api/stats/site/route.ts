import { NextResponse } from 'next/server';

export async function GET() {
  // Return mocked data for now
  const mockStats = {
    success: true,
    data: {
      totalTests: 12500,
      totalUsers: 3200,
      avgWpm: 68,
      highestWpm: {
        wpm: 156,
        username: "speedtyper92"
      },
      recentTests: 342
    }
  };

  return NextResponse.json(mockStats);
} 