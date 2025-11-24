/**
 * Professional Google Places API Integration
 *
 * Uses Google Places API (New) for verified, structured business data
 * - Verified phone numbers
 * - Accurate addresses
 * - Real ratings and reviews
 * - Business hours, website, etc.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface PlacesSearchParams {
  query: string;
  location?: string;
  maxResults?: number;
  minRating?: number;
}

export interface DiscoveredLead {
  name: string;
  industry: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  rating: number | null;
  reviewCount: number | null;
  opportunityScore: number;
  painPoints: string[];
  confidenceScore: number;
  source: string;
}

export interface DiscoveryResult {
  leads: DiscoveredLead[];
  totalFound: number;
  searchQuery: string;
  timestamp: Date;
}

/**
 * Search using Google Places API (New) - Text Search with AGGRESSIVE multi-strategy approach
 * Extracts MAXIMUM results for ANY specific niche user query
 */
async function searchPlaces(params: PlacesSearchParams): Promise<any[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('[Places] No Google Places API key found');
    return [];
  }

  const allPlaces = new Map<string, any>(); // Dedupe by place ID

  try {
    // STRATEGY 1: Exact query as user typed
    const exactQuery = params.location
      ? `${params.query} in ${params.location}`
      : params.query;

    console.log(`[Places] Strategy 1: Exact query "${exactQuery}"`);
    const exact = await makeSearchRequest(apiKey, exactQuery, params.maxResults || 20);
    exact.forEach(p => allPlaces.set(p.id || p.displayName?.text, p));

    // STRATEGY 2: Broader category search + location (e.g., "hamburger restaurant near Sunset Blvd, LA")
    if (params.location) {
      const broaderQuery = `${extractBroaderTerm(params.query)} near ${params.location}`;
      console.log(`[Places] Strategy 2: Broader near "${broaderQuery}"`);
      const broader = await makeSearchRequest(apiKey, broaderQuery, params.maxResults || 20);
      broader.forEach(p => allPlaces.set(p.id || p.displayName?.text, p));
    }

    // STRATEGY 3: Just location-based category search (e.g., "hamburger restaurant in Los Angeles")
    if (params.location) {
      const categoryOnly = `${extractCategory(params.query)} in ${params.location}`;
      console.log(`[Places] Strategy 3: Category only "${categoryOnly}"`);
      const category = await makeSearchRequest(apiKey, categoryOnly, params.maxResults || 20);
      category.forEach(p => allPlaces.set(p.id || p.displayName?.text, p));
    }

    const uniquePlaces = Array.from(allPlaces.values());
    console.log(`[Places] Found ${uniquePlaces.length} unique verified businesses across all strategies`);
    return uniquePlaces;

  } catch (error) {
    console.error('[Places] Search error:', error);
    return [];
  }
}

/**
 * Make a single Google Places API request
 */
async function makeSearchRequest(apiKey: string, textQuery: string, maxResults: number): Promise<any[]> {
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.types,places.businessStatus,places.addressComponents'
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: Math.min(maxResults, 20), // API limit is 20
        languageCode: 'en',
        rankPreference: 'RELEVANCE'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Places] API error ${response.status}:`, errorText);
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('[Places] Request error:', error);
    return [];
  }
}

/**
 * Extract broader term from specific query
 * e.g., "smash burgers" -> "burgers" or "hamburger restaurant"
 */
function extractBroaderTerm(query: string): string {
  const lower = query.toLowerCase();

  // Common patterns
  if (lower.includes('smash burger')) return 'hamburger restaurant';
  if (lower.includes('burger')) return 'hamburger restaurant';
  if (lower.includes('pizza')) return 'pizza restaurant';
  if (lower.includes('taco')) return 'mexican restaurant';
  if (lower.includes('sushi')) return 'sushi restaurant';
  if (lower.includes('indian') || lower.includes('curry')) return 'indian restaurant';
  if (lower.includes('chinese')) return 'chinese restaurant';
  if (lower.includes('italian')) return 'italian restaurant';
  if (lower.includes('thai')) return 'thai restaurant';

  // Default: just return the query
  return query;
}

/**
 * Extract just the category from query
 */
function extractCategory(query: string): string {
  const lower = query.toLowerCase();

  // Extract core category
  if (lower.includes('burger')) return 'burger restaurant';
  if (lower.includes('pizza')) return 'pizza';
  if (lower.includes('taco')) return 'tacos';
  if (lower.includes('indian')) return 'indian food';
  if (lower.includes('sushi')) return 'sushi';
  if (lower.includes('chinese')) return 'chinese food';
  if (lower.includes('restaurant')) return 'restaurant';

  return query;
}

/**
 * Convert Google Places result to structured lead data
 */
function convertPlaceToLead(place: any, industry: string): DiscoveredLead | null {
  try {
    const displayName = place.displayName?.text;
    const address = place.formattedAddress;

    if (!displayName || !address) {
      return null;
    }

    // Parse address components
    const components = place.addressComponents || [];
    let city = '';
    let state = '';
    let zipCode = null;

    for (const component of components) {
      const types = component.types || [];
      if (types.includes('locality')) {
        city = component.longText || component.shortText || '';
      } else if (types.includes('administrative_area_level_1')) {
        state = component.shortText || '';
      } else if (types.includes('postal_code')) {
        zipCode = component.longText || component.shortText || '';
      }
    }

    // Extract phone number (prefer national format)
    const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || null;

    // Get business type/industry from types
    const types = place.types || [];
    const businessType = types[0]?.replace(/_/g, ' ') || industry;

    return {
      name: displayName,
      industry: businessType,
      phone,
      email: null, // Google Places doesn't provide emails
      website: place.websiteUri || null,
      address,
      city,
      state,
      zipCode,
      rating: place.rating || null,
      reviewCount: place.userRatingCount || null,
      opportunityScore: 50, // Will be calculated by AI
      painPoints: [],       // Will be analyzed by AI
      confidenceScore: 95,  // High confidence - verified Google data
      source: 'google_places_api'
    };

  } catch (error) {
    console.error('[Places] Error converting place:', error);
    return null;
  }
}

/**
 * Use AI to analyze leads and calculate opportunity scores
 */
async function analyzeLeadWithAI(lead: DiscoveredLead): Promise<DiscoveredLead> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[AI] No Anthropic API key - skipping AI analysis');
    return lead;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Analyze this business as a B2B sales lead and provide:
1. Opportunity Score (0-100): How good of a prospect is this for B2B services?
2. Key Pain Points: 3-5 specific challenges this business likely faces

Business: ${lead.name}
Industry: ${lead.industry}
Location: ${lead.city}, ${lead.state}
Rating: ${lead.rating ? lead.rating + ' stars' : 'N/A'}
Reviews: ${lead.reviewCount || 'N/A'}
Has Website: ${lead.website ? 'Yes' : 'No'}
Has Phone: ${lead.phone ? 'Yes' : 'No'}

Respond ONLY with valid JSON:
{
  "opportunityScore": number (0-100),
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return lead;
    }

    // Parse AI response
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

    const analysis = JSON.parse(jsonText);

    return {
      ...lead,
      opportunityScore: analysis.opportunityScore || lead.opportunityScore,
      painPoints: analysis.painPoints || lead.painPoints
    };

  } catch (error) {
    console.error('[AI] Analysis error:', error);
    return lead;
  }
}

/**
 * Discover high-quality leads using Google Places API
 */
export async function discoverLeadsWithPlaces(params: PlacesSearchParams): Promise<DiscoveryResult> {
  console.log(`[Places Discovery] Starting: ${params.query} ${params.location ? 'in ' + params.location : ''}`);

  const startTime = Date.now();

  // Step 1: Search Google Places
  const places = await searchPlaces(params);

  // Step 2: Convert to leads
  const leads: DiscoveredLead[] = [];
  const industry = params.query; // Use query as industry identifier

  for (const place of places) {
    const lead = convertPlaceToLead(place, industry);

    if (!lead) {
      continue;
    }

    // Apply filters
    if (params.minRating && lead.rating && lead.rating < params.minRating) {
      console.log(`[Places] Filtering out ${lead.name} - rating too low`);
      continue;
    }

    // Only include businesses with contact info
    if (lead.phone || lead.website) {
      leads.push(lead);
      console.log(`[Places] ✓ Added: ${lead.name} (${lead.phone || lead.website})`);
    }
  }

  // Step 3: AI analysis for top leads (limit to save API calls)
  console.log(`[Places] Analyzing top ${Math.min(leads.length, 10)} leads with AI...`);
  const analyzedLeads = await Promise.all(
    leads.slice(0, 10).map(lead => analyzeLeadWithAI(lead))
  );

  // Combine analyzed + non-analyzed leads
  const finalLeads = [...analyzedLeads, ...leads.slice(10)];

  const duration = Date.now() - startTime;
  console.log(`[Places Discovery] Completed in ${duration}ms - ${finalLeads.length} qualified leads`);

  return {
    leads: finalLeads,
    totalFound: places.length,
    searchQuery: `${params.query}${params.location ? ' in ' + params.location : ''}`,
    timestamp: new Date()
  };
}

/**
 * Rank leads by opportunity score
 */
export function rankLeads(leads: DiscoveredLead[]): DiscoveredLead[] {
  return leads.sort((a, b) => {
    // Primary: opportunity score
    if (b.opportunityScore !== a.opportunityScore) {
      return b.opportunityScore - a.opportunityScore;
    }

    // Secondary: rating
    const aRating = a.rating || 0;
    const bRating = b.rating || 0;
    if (bRating !== aRating) {
      return bRating - aRating;
    }

    // Tertiary: review count
    const aReviews = a.reviewCount || 0;
    const bReviews = b.reviewCount || 0;
    return bReviews - aReviews;
  });
}
