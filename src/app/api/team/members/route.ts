/**
 * API Route for team members operations
 * Server-side only - SQLite can't run in browser
 */

import { NextResponse } from 'next/server';
import { getTeamMembers } from '@/lib/team';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team/members - Get all team members
 */
export async function GET() {
  try {
    const members = await getTeamMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
