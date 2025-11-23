/**
 * AI-Powered Lead Search Engine
 * Uses Claude Sonnet 4.5 + Serper API for REAL lead discovery
 * NO DEMOS - Only real API calls
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { discoverLeads } from '@/lib/ai-lead-discovery';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for complex searches

interface SearchQuery {
  query: string;
}

interface ParsedQuery {
  industry?: string;
  location?: string;
  limit?: number;
  filters?: {
    maxRating?: number;
    minRating?: number;
    hasWebsite?: boolean;
    minReviews?: number;
    maxReviews?: number;
  };
  searchTerms: string;
}

/**
 * Parse natural language query using Claude Sonnet 4.5
 */
async function parseSearchQuery(query: string): Promise<ParsedQuery> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `Parse this business search query and extract structured information:

Query: "${query}"

Extract:
1. Industry/business type (e.g., "HVAC", "dental", "plumbing", "restaurant")
2. Location (city, state)
3. Number of results wanted (default: 20)
4. Filters:
   - Rating requirements (e.g., "below 4.5 stars", "poor ratings")
   - Website status (e.g., "no website", "without website")
   - Review count requirements

Respond ONLY with valid JSON in this exact format:
{
  "industry": "string or null",
  "location": "city, state or null",
  "limit": number,
  "filters": {
    "maxRating": number or null,
    "minRating": number or null,
    "hasWebsite": boolean or null,
    "minReviews": number or null,
    "maxReviews": number or null
  },
  "searchTerms": "string - simplified search terms for web search"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Claude');
  }

  // Strip markdown code blocks if present
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.substring(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.substring(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.substring(0, jsonText.length - 3);
  }
  jsonText = jsonText.trim();

  return JSON.parse(jsonText);
}

/**
 * Search for businesses using REAL AI-powered discovery
 * Uses Serper API + Claude Sonnet 4.5
 */
async function searchBusinesses(parsedQuery: ParsedQuery): Promise<any[]> {
  const industry = parsedQuery.industry || 'business';
  const location = parsedQuery.location || 'San Diego, CA';
  const limit = parsedQuery.limit || 20;

  console.log('[AI Search] Starting REAL lead discovery:', { industry, location, limit });

  try {
    // Use our TESTED lead discovery system
    const result = await discoverLeads({
      industry,
      location,
      maxResults: limit,
      minRating: parsedQuery.filters?.minRating,
    });

    console.log(`[AI Search] Found ${result.leads.length} real leads`);

    // Convert discovered leads to the format expected by the API
    return result.leads.map(lead => ({
      name: lead.name,
      industry: lead.industry,
      location: `${lead.city}, ${lead.state}`,
      address: lead.address,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      opportunityScore: lead.opportunityScore,
      painPoints: lead.painPoints,
      lat: null,
      lng: null,
    }));

  } catch (error) {
    console.error('[AI Search] Discovery error:', error);
    throw error;
  }
}


/**
 * POST /api/ai/search - AI-powered business search
 */
export async function POST(request: Request) {
  try {
    const body: SearchQuery = await request.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Search Query:', query);

    // Step 1: Parse query with Claude AI
    const parsedQuery = await parseSearchQuery(query);
    console.log('📋 Parsed Query:', parsedQuery);

    // Step 2: Search for businesses (tries multiple methods with fallbacks)
    const businesses = await searchBusinesses(parsedQuery);

    console.log(`🔍 Processing ${businesses.length} businesses`);

    // Step 3: Save leads to database
    // Get or create team
    let team = await db.get("SELECT id FROM teams LIMIT 1") as { id: string } | undefined;
    if (!team) {
      const teamId = crypto.randomUUID();
      await db.run(
        `INSERT INTO teams (id, team_name, created_at, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [teamId, "Sales Team"]
      );
      team = { id: teamId };
    }

    let leadsAdded = 0;

    for (const business of businesses) {
      try {
        // Check for duplicates
        const existing = business.phone
          ? await db.get("SELECT id FROM leads WHERE phone = ?", [business.phone])
          : await db.get("SELECT id FROM leads WHERE business_name = ? AND location LIKE ?",
              [business.name, `%${business.location}%`]);

        if (existing) {
          console.log(`[AI Search] Skipping duplicate: ${business.name}`);
          continue;
        }

        // Insert lead
        const leadId = crypto.randomUUID();
        const now = new Date().toISOString();

        await db.run(
          `INSERT INTO leads (
            id, team_id, business_name, industry, location, phone, email, website,
            rating, review_count, opportunity_score, pain_points,
            source, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            leadId,
            team.id,
            business.name,
            business.industry,
            business.location,
            business.phone,
            business.email,
            business.website,
            business.rating || 0,
            business.reviewCount || 0,
            business.opportunityScore,
            JSON.stringify(business.painPoints),
            'ai_search',
            now,
            now
          ]
        );

        leadsAdded++;
        console.log(`[AI Search] ✓ Added: ${business.name}`);
      } catch (error) {
        console.error(`[AI Search] Failed to insert ${business.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found and added ${leadsAdded} businesses to your leads table`,
      leadsFound: businesses.length,
      leadsAdded,
      query: parsedQuery,
    });

  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

