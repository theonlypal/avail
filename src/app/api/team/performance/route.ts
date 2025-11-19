/**
 * API Route for team performance metrics
 * Server-side only - SQLite can't run in browser
 */

import { NextResponse } from 'next/server';
import { getTeamPerformance } from '@/lib/team';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team/performance - Get team performance stats
 */
export async function GET() {
  try {
    const performance = await getTeamPerformance();
    return NextResponse.json(performance);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team performance' },
      { status: 500 }
    );
  }
}
