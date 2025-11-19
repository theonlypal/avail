/**
 * API Route for team operations
 * Server-side only - SQLite can't run in browser
 */

import { NextResponse } from 'next/server';
import { getCurrentTeam } from '@/lib/team';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team - Get current team with members
 */
export async function GET() {
  try {
    const team = await getCurrentTeam();

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
