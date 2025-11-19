import { NextResponse } from 'next/server';
import { getIndustryBreakdown } from '@/lib/leads-sqlite';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const breakdown = await getIndustryBreakdown();
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error('Error fetching industry breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry breakdown' },
      { status: 500 }
    );
  }
}
