import { NextResponse } from 'next/server';
import { getLeadStats } from '@/lib/leads-sqlite';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getLeadStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
