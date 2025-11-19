/**
 * AI-Powered Lead Search Engine
 * Uses Claude AI + Web Search to find businesses based on natural language queries
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDb, getDefaultTeamId } from '@/lib/db';
import { searchBusinesses as searchWithScraper } from '@/lib/web-scraper';
import { searchBusinessesWithClaude } from '@/lib/claude-scraper';
import { orchestrateSearch } from '@/lib/ai-orchestrator';

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
 * Parse natural language query using Claude AI
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

Respond in JSON format:
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
    model: 'claude-3-opus-20240229',
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

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse query');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Search for businesses using AI orchestrator
 * The orchestrator intelligently decides which tools to use
 */
async function searchBusinesses(parsedQuery: ParsedQuery): Promise<any[]> {
  const industry = parsedQuery.industry || 'business';
  const location = parsedQuery.location || 'San Diego, CA';
  const limit = parsedQuery.limit || 20;

  console.log('🔍 Starting AI-orchestrated business search:', { industry, location, limit });

  try {
    // Build a natural language query for the orchestrator
    const userQuery = buildOrchestratorQuery(parsedQuery, industry, location, limit);

    console.log('🤖 Using AI Orchestrator with query:', userQuery);

    // Let the AI orchestrator decide which tools to use
    const result = await orchestrateSearch(userQuery, {
      maxIterations: 5,
      enableEmailEnrichment: true,
      enableWebsiteAnalysis: false,
    });

    console.log(`✅ Orchestrator found ${result.businesses.length} businesses`);
    console.log(`🔧 Tools used: ${result.tools_used.join(', ')}`);
    console.log(`💭 Reasoning: ${result.reasoning}`);

    return result.businesses;

  } catch (error) {
    console.error('AI orchestrator error:', error);

    // Fallback: Try direct Claude AI search
    try {
      console.log('🔄 Falling back to direct Claude AI search...');
      const businesses = await searchBusinessesWithClaude({
        industry,
        location,
        limit,
        filters: parsedQuery.filters,
      });

      if (businesses.length > 0) {
        console.log(`✅ Found ${businesses.length} businesses using Claude AI fallback`);
        return businesses;
      }
    } catch (fallbackError) {
      console.error('Claude AI fallback error:', fallbackError);
    }

    // No results found from any source
    console.log('❌ No real business data found from any source');
    return [];
  }
}

/**
 * Build a natural language query for the AI orchestrator
 */
function buildOrchestratorQuery(parsedQuery: ParsedQuery, industry: string, location: string, limit: number): string {
  let query = `Find ${limit} ${industry} businesses in ${location}`;

  if (parsedQuery.filters) {
    const filters = [];

    if (parsedQuery.filters.maxRating) {
      filters.push(`with ratings below ${parsedQuery.filters.maxRating} stars`);
    }
    if (parsedQuery.filters.minRating) {
      filters.push(`with ratings above ${parsedQuery.filters.minRating} stars`);
    }
    if (parsedQuery.filters.hasWebsite === false) {
      filters.push(`without websites`);
    }
    if (parsedQuery.filters.minReviews) {
      filters.push(`with at least ${parsedQuery.filters.minReviews} reviews`);
    }
    if (parsedQuery.filters.maxReviews) {
      filters.push(`with no more than ${parsedQuery.filters.maxReviews} reviews`);
    }

    if (filters.length > 0) {
      query += ' ' + filters.join(' and ');
    }
  }

  query += '. For each business, find: name, address, phone, website, email, rating, and review count. Use multiple search sources for best coverage.';

  return query;
}

/**
 * Calculate opportunity score for a business
 */
function calculateOpportunityScore(business: any): number {
  let score = 50;

  // Rating-based scoring
  if (business.rating < 4.0) score += 20;
  else if (business.rating < 4.5) score += 15;
  else if (business.rating < 4.7) score += 10;

  // Review count scoring
  if (business.reviewCount < 50) score += 20;
  else if (business.reviewCount < 100) score += 15;
  else if (business.reviewCount > 200) score += 10;

  // Website scoring
  if (!business.website) score += 15;

  return Math.min(score, 95);
}

/**
 * Generate pain points based on business data
 */
function generatePainPoints(business: any): string[] {
  const painPoints: string[] = [];

  if (!business.website) {
    painPoints.push('No dedicated website - missing online presence');
  }

  if (business.rating < 4.0) {
    painPoints.push('Low online ratings need reputation management');
  } else if (business.rating < 4.5) {
    painPoints.push('Average ratings with room for improvement');
  }

  if (business.reviewCount < 50) {
    painPoints.push('Limited online reviews - need more customer engagement');
  }

  if (business.industry) {
    painPoints.push('Could benefit from digital transformation');
  }

  return painPoints.slice(0, 4);
}

/**
 * Generate recommended services
 */
function generateRecommendedServices(business: any): string[] {
  const services: string[] = [];

  if (!business.website) {
    services.push('Website Development');
  }

  if (business.rating < 4.5) {
    services.push('Review Management & Reputation Building');
  }

  if (business.reviewCount < 100) {
    services.push('Local SEO & Digital Marketing');
  }

  services.push('AI Chat Widget & Lead Capture');

  return services.slice(0, 4);
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

    // Step 3: Process and score businesses
    const db = getDb();
    const teamId = getDefaultTeamId();

    let leadsAdded = 0;

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO leads (
        id, team_id, business_name, industry, location,
        phone, email, website, rating, review_count,
        website_score, social_presence, ad_presence,
        opportunity_score, pain_points, recommended_services,
        ai_summary, lat, lng, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const business of businesses) {
      const opportunityScore = calculateOpportunityScore(business);
      const painPoints = generatePainPoints(business);
      const recommendedServices = generateRecommendedServices(business);

      const location = business.location || business.address || parsedQuery.location || 'Unknown';
      const industry = business.industry || parsedQuery.industry || 'Business';

      const aiSummary = `${business.name} is a ${industry} business in ${location} with ${(business.rating || 0).toFixed(1)} stars from ${business.reviewCount || business.reviews || 0} reviews. ${
        painPoints.length > 0 ? `Key opportunity: ${painPoints[0]}` : 'Growth potential identified.'
      }`;

      try {
        const id = `lead-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        stmt.run(
          id,
          teamId,
          business.name,
          industry,
          location,
          business.phone || null,
          business.email || null,
          business.website || null,
          business.rating || null,
          business.reviewCount || business.reviews || null,
          business.website ? 70 : 0,
          null,
          0,
          opportunityScore,
          JSON.stringify(painPoints),
          JSON.stringify(recommendedServices),
          aiSummary,
          business.lat || null,
          business.lng || null,
          'ai_search',
          new Date().toISOString()
        );

        leadsAdded++;
      } catch (error) {
        console.error(`Failed to insert ${business.name}:`, error);
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

