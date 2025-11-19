/**
 * API Route for leads using SQLite
 * Server-side only - SQLite can't run in browser
 */

import { NextResponse } from 'next/server';
import { fetchLeads as fetchLeadsSQLite, createLead } from '@/lib/leads-sqlite';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leads - Fetch all leads with optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filter: any = {};

    // Parse search
    const search = searchParams.get('search');
    if (search) filter.search = search;

    // Parse industries (comma-separated)
    const industries = searchParams.get('industries');
    if (industries) filter.industries = industries.split(',');

    // Parse score range
    const scoreMin = searchParams.get('scoreMin');
    const scoreMax = searchParams.get('scoreMax');
    if (scoreMin && scoreMax) {
      filter.scoreRange = [parseInt(scoreMin), parseInt(scoreMax)];
    }

    // Parse assigned to
    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) filter.assignedTo = assignedTo.split(',');

    const leads = await fetchLeadsSQLite(filter);

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads - Create a new lead
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = await createLead(body);
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
