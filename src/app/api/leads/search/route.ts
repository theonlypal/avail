/**
 * API Route for searching and scraping real leads
 * Calls the real lead scraper to fetch businesses from Google Maps and Yelp
 */

import { NextResponse } from 'next/server';
import { scrapeRealLeads } from '@/lib/real-lead-scraper';
import { getDefaultTeamId } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SearchRequest {
  industry?: string;
  city: string;
  sources: string[];
  limit: number;
  enrichWithEmails?: boolean;
}

/**
 * POST /api/leads/search - Search for real leads from external sources
 */
export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();
    const { industry, city, sources, limit } = body;

    // Validate inputs
    if (!city || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'City and at least one source are required' },
        { status: 400 }
      );
    }

    const teamId = getDefaultTeamId();

    // Scrape real leads based on the search criteria
    const leads = await scrapeRealLeads(teamId, {
      industry: industry || undefined,
      city,
      limit,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error searching for leads:', error);
    return NextResponse.json(
      { error: 'Failed to search for leads' },
      { status: 500 }
    );
  }
}
