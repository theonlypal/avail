/**
 * AI-Powered Lead Discovery System V2
 * Uses Claude Sonnet 4 + Serper API to discover real leads
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface DiscoveryQuery {
  industry: string;
  location: string;
  minRating?: number;
  targetCriteria?: string;
  maxResults?: number;
}

export interface DiscoveredLead {
  business_name: string;
  industry: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  lat?: number;
  lng?: number;
  source: string;
}

/**
 * Search for businesses using Serper API (Google Maps)
 */
async function searchBusinessesWithSerper(query: DiscoveryQuery): Promise<any[]> {
  const serperApiKey = process.env.SERPER_API_KEY;
  if (!serperApiKey) {
    throw new Error('SERPER_API_KEY not configured');
  }

  const searchQuery = `${query.industry} in ${query.location}`;

  console.log(`🔍 Searching Serper for: ${searchQuery}`);

  const response = await fetch('https://google.serper.dev/maps', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: searchQuery,
      gl: 'us',
      hl: 'en',
      num: query.maxResults || 20,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Use Claude to analyze and qualify discovered leads
 */
async function qualifyLeadsWithClaude(
  businesses: any[],
  query: DiscoveryQuery
): Promise<DiscoveredLead[]> {
  console.log(`🤖 Claude analyzing ${businesses.length} businesses...`);

  const prompt = `You are an expert sales lead qualifier. I have discovered ${businesses.length} businesses that match the criteria:
- Industry: ${query.industry}
- Location: ${query.location}
${query.targetCriteria ? `- Target Criteria: ${query.targetCriteria}` : ''}
${query.minRating ? `- Minimum Rating: ${query.minRating}` : ''}

Here are the businesses discovered:

${JSON.stringify(businesses, null, 2)}

Your task:
1. Analyze each business
2. Filter out any that clearly don't match the criteria
3. Return a JSON array of qualified leads with the following structure:
{
  "leads": [
    {
      "business_name": "string",
      "industry": "string (normalized industry category)",
      "location": "string (full address)",
      "phone": "string or null",
      "email": "string or null",
      "website": "string or null",
      "rating": number or null,
      "review_count": number or null,
      "lat": number or null,
      "lng": number or null,
      "qualification_reason": "string (why this is a good lead)"
    }
  ]
}

Important:
- Extract phone numbers in format (XXX) XXX-XXXX if available
- Extract website URLs if available
- Normalize the industry to a standard category (e.g., "restaurants", "retail", "healthcare", etc.)
- Include the qualification_reason for each lead
- Filter out chains or franchises unless they're locally owned
- Prioritize businesses with lower ratings if targeting sales/marketing services (more room for improvement)

Return ONLY the JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*"leads"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Claude response did not contain valid JSON');
      return convertBusinessesToLeads(businesses, query);
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(`✅ Claude qualified ${result.leads.length} leads`);

    return result.leads.map((lead: any) => ({
      business_name: lead.business_name,
      industry: lead.industry || query.industry,
      location: lead.location,
      phone: lead.phone || null,
      email: lead.email || null,
      website: lead.website || null,
      rating: lead.rating || null,
      review_count: lead.review_count || null,
      lat: lead.lat || null,
      lng: lead.lng || null,
      source: 'ai_discovery',
    }));
  } catch (error) {
    console.error('❌ Error qualifying leads with Claude:', error);
    // Fallback: convert all businesses to leads
    return convertBusinessesToLeads(businesses, query);
  }
}

/**
 * Fallback: Convert Serper results directly to leads
 */
function convertBusinessesToLeads(businesses: any[], query: DiscoveryQuery): DiscoveredLead[] {
  return businesses
    .filter((b) => {
      // Apply basic filters
      if (query.minRating && b.rating < query.minRating) return false;
      return true;
    })
    .map((business) => ({
      business_name: business.title || business.name,
      industry: query.industry,
      location: business.address || query.location,
      phone: business.phoneNumber || business.phone || null,
      email: null,
      website: business.website || null,
      rating: business.rating || null,
      review_count: business.reviews || business.reviewCount || null,
      lat: business.gps_coordinates?.latitude || business.latitude || null,
      lng: business.gps_coordinates?.longitude || business.longitude || null,
      source: 'serper_direct',
    }));
}

/**
 * Main discovery function
 */
export async function discoverLeads(query: DiscoveryQuery): Promise<DiscoveredLead[]> {
  try {
    console.log('🚀 Starting AI lead discovery...');
    console.log(`   Industry: ${query.industry}`);
    console.log(`   Location: ${query.location}`);
    console.log(`   Max Results: ${query.maxResults || 20}`);

    // Step 1: Search for businesses using Serper
    const businesses = await searchBusinessesWithSerper(query);

    if (businesses.length === 0) {
      console.log('⚠️  No businesses found');
      return [];
    }

    console.log(`📍 Found ${businesses.length} businesses from Serper`);

    // Step 2: Use Claude to qualify and enrich the leads
    const qualifiedLeads = await qualifyLeadsWithClaude(businesses, query);

    console.log(`✨ Discovery complete! Found ${qualifiedLeads.length} qualified leads`);

    return qualifiedLeads;
  } catch (error) {
    console.error('❌ Lead discovery failed:', error);
    throw error;
  }
}

/**
 * Discover leads in batches for multiple locations/industries
 */
export async function discoverLeadsBatch(
  queries: DiscoveryQuery[]
): Promise<DiscoveredLead[]> {
  const allLeads: DiscoveredLead[] = [];

  for (const query of queries) {
    try {
      const leads = await discoverLeads(query);
      allLeads.push(...leads);

      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to discover leads for ${query.industry} in ${query.location}:`, error);
    }
  }

  return allLeads;
}
