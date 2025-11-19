/**
 * AI-Powered Lead Discovery Service
 *
 * Uses Serper API for web search and Anthropic Claude for intelligent lead qualification
 * This replaces fake/demo leads with real, dynamically discovered businesses
 */

import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization of Anthropic client to ensure environment variables are loaded
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

export interface SearchParams {
  industry: string;
  location: string;
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
 * Search for businesses using Serper API (Google Search)
 */
async function searchBusinesses(params: SearchParams): Promise<any[]> {
  const serperApiKey = process.env.SERPER_API_KEY;

  if (!serperApiKey) {
    console.warn("No Serper API key found, using fallback");
    return [];
  }

  try {
    // Build search query for local businesses
    const searchQuery = `${params.industry} businesses in ${params.location} phone number contact`;

    console.log(`[AI Discovery] Searching: ${searchQuery}`);

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchQuery,
        num: params.maxResults || 20,
        gl: "us", // Geolocation: United States
        hl: "en", // Language: English
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    // Return organic results
    return data.organic || [];
  } catch (error) {
    console.error("[AI Discovery] Serper search error:", error);
    return [];
  }
}

/**
 * Use Anthropic Claude to extract and qualify lead information from search results
 */
async function qualifyLeadWithAI(
  searchResult: any,
  industry: string
): Promise<DiscoveredLead | null> {
  try {
    const prompt = `You are a B2B lead qualification expert. Analyze this business search result and extract structured information.

Search Result:
Title: ${searchResult.title}
URL: ${searchResult.link}
Snippet: ${searchResult.snippet}

Industry Context: ${industry}

Extract and provide:
1. Business name (clean, official name)
2. Phone number (if found in snippet, format as (XXX) XXX-XXXX)
3. Address components (street, city, state, zip)
4. Estimated rating (if mentioned)
5. Review count (if mentioned)
6. Key pain points this business might have (3-5 specific challenges)
7. Opportunity score (0-100, based on digital presence, reviews, growth potential)
8. Confidence score (0-100, how confident you are in this data)

Respond ONLY with valid JSON in this exact format:
{
  "name": "Business Name",
  "phone": "(619) 555-1234" or null,
  "address": "123 Main St",
  "city": "San Diego",
  "state": "CA",
  "zipCode": "92101" or null,
  "rating": 4.2 or null,
  "reviewCount": 87 or null,
  "painPoints": ["Specific pain point 1", "Specific pain point 2", "Specific pain point 3"],
  "opportunityScore": 75,
  "confidenceScore": 85
}`;

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.substring(7); // Remove ```json
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.substring(3); // Remove ```
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.substring(0, jsonText.length - 3); // Remove closing ```
    }
    jsonText = jsonText.trim();

    // Parse JSON response
    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (!parsed.name || !parsed.city || !parsed.state) {
      console.log(`[AI Discovery] Skipping - missing required fields for ${searchResult.title}`);
      return null;
    }

    // Build lead object
    const lead: DiscoveredLead = {
      name: parsed.name,
      industry: industry,
      phone: parsed.phone || null,
      email: null, // Will be enriched later
      website: searchResult.link || null,
      address: parsed.address || "",
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode || null,
      rating: parsed.rating || null,
      reviewCount: parsed.reviewCount || null,
      opportunityScore: parsed.opportunityScore || 50,
      painPoints: parsed.painPoints || [],
      confidenceScore: parsed.confidenceScore || 50,
      source: "serper_ai",
    };

    return lead;
  } catch (error) {
    console.error("[AI Discovery] Lead qualification error:", error);
    return null;
  }
}

/**
 * Discover leads using AI-powered search and qualification
 */
export async function discoverLeads(params: SearchParams): Promise<DiscoveryResult> {
  console.log(`[AI Discovery] Starting discovery for ${params.industry} in ${params.location}`);

  const startTime = Date.now();

  // Step 1: Search for businesses using Serper
  const searchResults = await searchBusinesses(params);
  console.log(`[AI Discovery] Found ${searchResults.length} search results`);

  // Step 2: Qualify each result with AI
  const leads: DiscoveredLead[] = [];

  for (const result of searchResults) {
    try {
      const lead = await qualifyLeadWithAI(result, params.industry);

      if (lead) {
        // Apply filters
        if (params.minRating && lead.rating && lead.rating < params.minRating) {
          console.log(`[AI Discovery] Skipping ${lead.name} - rating too low`);
          continue;
        }

        // Only include if we have at least a phone or website
        if (lead.phone || lead.website) {
          leads.push(lead);
          console.log(`[AI Discovery] ✓ Qualified: ${lead.name} (score: ${lead.opportunityScore})`);
        }
      }

      // Rate limiting - wait 500ms between AI calls to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stop if we've reached max results
      if (params.maxResults && leads.length >= params.maxResults) {
        break;
      }
    } catch (error) {
      console.error(`[AI Discovery] Error processing result:`, error);
      continue;
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[AI Discovery] Completed in ${duration}ms - ${leads.length} qualified leads`);

  return {
    leads,
    totalFound: searchResults.length,
    searchQuery: `${params.industry} in ${params.location}`,
    timestamp: new Date(),
  };
}

/**
 * Discover leads across multiple locations
 */
export async function discoverLeadsMultiLocation(
  industry: string,
  locations: string[],
  maxPerLocation: number = 10
): Promise<DiscoveryResult> {
  console.log(`[AI Discovery] Multi-location discovery: ${industry} across ${locations.length} locations`);

  const allLeads: DiscoveredLead[] = [];
  let totalFound = 0;

  for (const location of locations) {
    const result = await discoverLeads({
      industry,
      location,
      maxResults: maxPerLocation,
    });

    allLeads.push(...result.leads);
    totalFound += result.totalFound;

    // Wait between location searches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    leads: allLeads,
    totalFound,
    searchQuery: `${industry} in ${locations.join(", ")}`,
    timestamp: new Date(),
  };
}

/**
 * Score and rank discovered leads
 */
export function rankLeads(leads: DiscoveredLead[]): DiscoveredLead[] {
  return leads.sort((a, b) => {
    // Primary sort by opportunity score
    if (b.opportunityScore !== a.opportunityScore) {
      return b.opportunityScore - a.opportunityScore;
    }

    // Secondary sort by confidence score
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }

    // Tertiary sort by review count
    const aReviews = a.reviewCount || 0;
    const bReviews = b.reviewCount || 0;
    return bReviews - aReviews;
  });
}
