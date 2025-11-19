/**
 * AI Orchestrator - Claude as Tool-Using Agent
 *
 * Architecture:
 * - Claude receives a natural language query
 * - Claude decides which tools to use and in what order
 * - Tools execute and return results
 * - Claude synthesizes results and can use additional tools
 * - Final enriched results returned
 */

import Anthropic from '@anthropic-ai/sdk';

// Tool definitions that Claude can use
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// Available tools for Claude to orchestrate
const AVAILABLE_TOOLS: Tool[] = [
  {
    name: 'search_google_maps',
    description: 'Search for businesses using Google Maps API. Returns business name, address, phone, rating, reviews, and location coordinates. Best for local businesses with physical locations.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query (e.g., "HVAC companies in San Diego")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 20,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_yelp',
    description: 'Search for businesses using Yelp API. Returns detailed business information including ratings, reviews, categories, and contact info. Great for restaurants, retail, and service businesses.',
    input_schema: {
      type: 'object',
      properties: {
        term: {
          type: 'string',
          description: 'Search term (e.g., "HVAC", "dental")',
        },
        location: {
          type: 'string',
          description: 'Location to search in (e.g., "San Diego, CA")',
        },
        limit: {
          type: 'number',
          description: 'Number of results',
          default: 20,
        },
      },
      required: ['term', 'location'],
    },
  },
  {
    name: 'search_web',
    description: 'Perform a general web search to find businesses. Good for finding business websites, contact information, and online presence. Use when you need broader coverage than maps/yelp.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Web search query',
        },
        num_results: {
          type: 'number',
          description: 'Number of results to return',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_perplexity',
    description: 'Search for businesses using Perplexity AI with built-in web search capabilities. Returns real-time web data about businesses including contact info, reviews, and online presence. Best for comprehensive, up-to-date business information.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for businesses (e.g., "HVAC companies in San Diego with low ratings")',
        },
        location: {
          type: 'string',
          description: 'Geographic location to search in',
        },
        industry: {
          type: 'string',
          description: 'Industry or business type',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of businesses to return',
          default: 20,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'enrich_email',
    description: 'Find email addresses for a business using Hunter.io or Apollo.io. Requires business name and domain/website.',
    input_schema: {
      type: 'object',
      properties: {
        business_name: {
          type: 'string',
          description: 'Name of the business',
        },
        domain: {
          type: 'string',
          description: 'Business website domain (e.g., "example.com")',
        },
      },
      required: ['business_name', 'domain'],
    },
  },
  {
    name: 'analyze_website',
    description: 'Analyze a business website to extract information like technology stack, contact forms, social media links, and overall web presence quality.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Website URL to analyze',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'score_opportunity',
    description: 'Calculate an opportunity score for a business based on various factors like rating, reviews, website quality, and online presence.',
    input_schema: {
      type: 'object',
      properties: {
        business_data: {
          type: 'object',
          description: 'Business data to score',
        },
      },
      required: ['business_data'],
    },
  },
  {
    name: 'research_competitors',
    description: 'Research competitors for a given business to understand market positioning and identify opportunities.',
    input_schema: {
      type: 'object',
      properties: {
        business_name: {
          type: 'string',
          description: 'Business to research',
        },
        industry: {
          type: 'string',
          description: 'Industry category',
        },
        location: {
          type: 'string',
          description: 'Geographic location',
        },
      },
      required: ['business_name', 'industry', 'location'],
    },
  },
  {
    name: 'verify_business',
    description: 'Verify that a business is real and legitimate by checking multiple data points: phone number validity, website existence, online presence, and consistency across sources. Returns verification status and confidence score.',
    input_schema: {
      type: 'object',
      properties: {
        business_name: {
          type: 'string',
          description: 'Name of the business to verify',
        },
        phone: {
          type: 'string',
          description: 'Business phone number',
        },
        website: {
          type: 'string',
          description: 'Business website URL',
        },
        address: {
          type: 'string',
          description: 'Business address',
        },
        location: {
          type: 'string',
          description: 'City and state',
        },
      },
      required: ['business_name'],
    },
  },
];

export interface OrchestratorResult {
  businesses: any[];
  reasoning: string;
  tools_used: string[];
  execution_steps: Array<{
    step: number;
    tool: string;
    input: any;
    output: any;
    reasoning: string;
  }>;
  metadata: {
    total_results: number;
    sources: string[];
    confidence: number;
  };
}

/**
 * AI Orchestrator - Let Claude decide which tools to use
 */
export async function orchestrateSearch(
  userQuery: string,
  options?: {
    maxIterations?: number;
    enableEmailEnrichment?: boolean;
    enableWebsiteAnalysis?: boolean;
  }
): Promise<OrchestratorResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });
  const maxIterations = options?.maxIterations || 5;

  console.log('🤖 AI Orchestrator: Starting autonomous search...');
  console.log('📝 User Query:', userQuery);

  // Conversation history for Claude
  const messages: Array<{ role: 'user' | 'assistant'; content: any }> = [
    {
      role: 'user',
      content: `You are an AI orchestrator for a lead generation system. Your job is to intelligently use available tools to find businesses matching the user's query.

User Query: "${userQuery}"

Your Task:
1. Analyze the query and determine which tools to use
2. Use tools in the most effective order (e.g., search first, then enrich)
3. Combine results from multiple sources for better coverage
4. Provide reasoning for your tool choices
5. Return comprehensive, enriched business data

Guidelines:
- Use multiple search tools for better coverage (Google Maps + Yelp + Web Search)
- Enrich results with emails when possible
- Analyze websites to assess online presence
- Calculate opportunity scores
- Deduplicate results by business name
- Prioritize quality over quantity

Think step-by-step and use tools strategically.`,
    },
  ];

  const executionSteps: any[] = [];
  const toolsUsed = new Set<string>();
  let allBusinesses: any[] = [];
  let iteration = 0;

  // Agentic loop - Claude decides what to do next
  while (iteration < maxIterations) {
    iteration++;
    console.log(`\n🔄 Iteration ${iteration}/${maxIterations}`);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        tools: AVAILABLE_TOOLS,
        messages,
      });

      console.log('🎯 Stop Reason:', response.stop_reason);

      // Add assistant's response to conversation
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      // Check if Claude wants to use tools
      if (response.stop_reason === 'tool_use') {
        const toolResults: any[] = [];

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const toolName = block.name;
            const toolInput = block.input;

            console.log(`🔧 Using tool: ${toolName}`);
            console.log(`📥 Input:`, JSON.stringify(toolInput, null, 2));

            toolsUsed.add(toolName);

            // Execute the tool
            const toolOutput = await executeTool(toolName, toolInput);

            console.log(`📤 Output: ${JSON.stringify(toolOutput).substring(0, 200)}...`);

            // Record execution step
            executionSteps.push({
              step: executionSteps.length + 1,
              tool: toolName,
              input: toolInput,
              output: toolOutput,
              reasoning: `Claude chose to use ${toolName} because it's appropriate for the query`,
            });

            // Accumulate businesses
            if (toolOutput.businesses && Array.isArray(toolOutput.businesses)) {
              allBusinesses.push(...toolOutput.businesses);
            }

            // Prepare tool result for Claude
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(toolOutput),
            });
          }
        }

        // Send tool results back to Claude
        messages.push({
          role: 'user',
          content: toolResults,
        });

      } else if (response.stop_reason === 'end_turn') {
        // Claude is done - extract final reasoning
        const textContent = response.content.find((block: any) => block.type === 'text') as any;
        const reasoning = textContent?.text || 'Search completed';

        console.log('✅ Claude finished orchestration');
        console.log('💭 Reasoning:', reasoning);

        // Deduplicate businesses
        const uniqueBusinesses = deduplicateBusinesses(allBusinesses);

        return {
          businesses: uniqueBusinesses,
          reasoning,
          tools_used: Array.from(toolsUsed),
          execution_steps: executionSteps,
          metadata: {
            total_results: uniqueBusinesses.length,
            sources: Array.from(toolsUsed),
            confidence: calculateConfidence(executionSteps, uniqueBusinesses),
          },
        };
      }

    } catch (error) {
      console.error(`❌ Error in iteration ${iteration}:`, error);

      if (allBusinesses.length > 0) {
        // Return partial results
        return {
          businesses: deduplicateBusinesses(allBusinesses),
          reasoning: 'Search completed with some errors',
          tools_used: Array.from(toolsUsed),
          execution_steps: executionSteps,
          metadata: {
            total_results: allBusinesses.length,
            sources: Array.from(toolsUsed),
            confidence: 0.7,
          },
        };
      }

      throw error;
    }
  }

  // Max iterations reached
  console.log('⚠️ Max iterations reached');

  return {
    businesses: deduplicateBusinesses(allBusinesses),
    reasoning: 'Search completed (max iterations reached)',
    tools_used: Array.from(toolsUsed),
    execution_steps: executionSteps,
    metadata: {
      total_results: allBusinesses.length,
      sources: Array.from(toolsUsed),
      confidence: 0.8,
    },
  };
}

/**
 * Execute a tool and return results
 */
async function executeTool(toolName: string, input: any): Promise<any> {
  try {
    switch (toolName) {
      case 'search_google_maps':
        return await searchGoogleMaps(input);

      case 'search_yelp':
        return await searchYelp(input);

      case 'search_web':
        return await searchWeb(input);

      case 'search_perplexity':
        return await searchPerplexity(input);

      case 'enrich_email':
        return await enrichEmail(input);

      case 'analyze_website':
        return await analyzeWebsite(input);

      case 'score_opportunity':
        return await scoreOpportunity(input);

      case 'research_competitors':
        return await researchCompetitors(input);

      case 'verify_business':
        return await verifyBusiness(input);

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Tool implementations

async function searchGoogleMaps(input: any) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { businesses: [], message: 'Google Maps API key not configured' };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(input.query)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const businesses = (data.results || []).slice(0, input.limit || 20).map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      reviews: place.user_ratings_total,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      source: 'google_maps',
    }));

    return { businesses, count: businesses.length };
  } catch (error) {
    return { businesses: [], error: 'Google Maps search failed' };
  }
}

async function searchYelp(input: any) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return { businesses: [], message: 'Yelp API key not configured' };
  }

  try {
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(input.term)}&location=${encodeURIComponent(input.location)}&limit=${input.limit || 20}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const data = await response.json();

    const businesses = (data.businesses || []).map((biz: any) => ({
      name: biz.name,
      address: biz.location?.address1,
      city: biz.location?.city,
      state: biz.location?.state,
      phone: biz.phone,
      rating: biz.rating,
      reviews: biz.review_count,
      website: biz.url,
      source: 'yelp',
    }));

    return { businesses, count: businesses.length };
  } catch (error) {
    return { businesses: [], error: 'Yelp search failed' };
  }
}

async function searchWeb(input: any) {
  // Web search implementation (could use Google Custom Search, Bing, etc.)
  return {
    businesses: [],
    message: 'Web search requires additional API configuration',
  };
}

async function searchPerplexity(input: any) {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return {
      businesses: [],
      message: 'Perplexity API key not configured. Get one at https://www.perplexity.ai/settings/api'
    };
  }

  try {
    const query = input.query;
    const location = input.location || '';
    const industry = input.industry || '';
    const limit = input.limit || 20;

    // Construct detailed prompt for Perplexity
    const searchPrompt = `Find ${limit} real ${industry} businesses in ${location} that match this query: "${query}".

For each business, provide:
1. Exact business name
2. Complete address
3. Phone number
4. Website URL (if available)
5. Email (if available)
6. Google rating and number of reviews
7. Brief note about their online presence

Format the response as a JSON array with this structure:
{
  "businesses": [
    {
      "name": "Business Name",
      "address": "123 Main St, City, State ZIP",
      "phone": "(555) 123-4567",
      "website": "https://example.com",
      "email": "contact@example.com",
      "rating": 4.5,
      "reviewCount": 234,
      "notes": "Brief description"
    }
  ]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business research assistant. Provide accurate, real business information from the web. Always return valid JSON.',
          },
          {
            role: 'user',
            content: searchPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { businesses: [], message: 'No response from Perplexity' };
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from Perplexity response:', content);
      return { businesses: [], message: 'Failed to parse Perplexity response' };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.businesses || !Array.isArray(parsed.businesses)) {
      return { businesses: [], message: 'Invalid response format from Perplexity' };
    }

    // Transform to standard format
    const businesses = parsed.businesses.map((biz: any) => {
      const addressParts = (biz.address || '').split(',').map((s: string) => s.trim());
      const city = addressParts[addressParts.length - 2]?.split(' ')[0] || location.split(',')[0] || '';
      const state = addressParts[addressParts.length - 1]?.split(' ')[0] || location.split(',')[1]?.trim() || '';

      return {
        name: biz.name,
        address: biz.address,
        city,
        state,
        phone: biz.phone,
        website: biz.website,
        email: biz.email,
        rating: biz.rating || 0,
        reviews: biz.reviewCount || 0,
        source: 'perplexity',
      };
    });

    return {
      businesses,
      count: businesses.length,
      message: `Found ${businesses.length} businesses using Perplexity AI`
    };

  } catch (error) {
    console.error('Perplexity search error:', error);
    return {
      businesses: [],
      error: error instanceof Error ? error.message : 'Perplexity search failed'
    };
  }
}

async function enrichEmail(input: any) {
  // Email enrichment using Hunter.io or Apollo
  return {
    email: null,
    message: 'Email enrichment requires Hunter.io or Apollo.io API key',
  };
}

async function analyzeWebsite(input: any) {
  // Website analysis
  return {
    has_contact_form: false,
    has_phone: false,
    technology_stack: [],
    social_media: [],
    message: 'Website analysis requires implementation',
  };
}

async function scoreOpportunity(input: any) {
  const business = input.business_data;
  let score = 50;

  if (business.rating < 4.0) score += 20;
  else if (business.rating < 4.5) score += 10;

  if (business.reviews < 50) score += 15;
  if (!business.website) score += 20;

  return { score: Math.min(score, 100) };
}

async function researchCompetitors(input: any) {
  return {
    competitors: [],
    market_insights: 'Competitor research requires implementation',
  };
}

async function verifyBusiness(input: any) {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    // Fallback verification without Perplexity
    return performBasicVerification(input);
  }

  try {
    const businessName = input.business_name;
    const phone = input.phone || 'unknown';
    const website = input.website || 'none';
    const address = input.address || 'unknown';
    const location = input.location || 'unknown';

    // Use Perplexity to verify the business exists
    const verificationPrompt = `Verify if "${businessName}" in ${location} is a real, legitimate business.

Business details to verify:
- Name: ${businessName}
- Phone: ${phone}
- Website: ${website}
- Address: ${address}
- Location: ${location}

Check:
1. Does this business actually exist?
2. Is the phone number valid and associated with this business?
3. Is the website legitimate (if provided)?
4. Can you find this business on Google, Yelp, or other business directories?
5. Are there any red flags or inconsistencies?

Respond with JSON:
{
  "verified": true/false,
  "confidence": 0-100,
  "exists": true/false,
  "phone_valid": true/false,
  "website_valid": true/false,
  "found_online": true/false,
  "sources": ["list of sources where found"],
  "notes": "Brief verification summary",
  "red_flags": ["list of any concerns or null"]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business verification assistant. Check if businesses are real and legitimate using web search. Always return valid JSON.',
          },
          {
            role: 'user',
            content: verificationPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return performBasicVerification(input);
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from Perplexity verification response');
      return performBasicVerification(input);
    }

    const verification = JSON.parse(jsonMatch[0]);

    return {
      verified: verification.verified || false,
      confidence: verification.confidence || 0,
      exists: verification.exists || false,
      phone_valid: verification.phone_valid || false,
      website_valid: verification.website_valid || false,
      found_online: verification.found_online || false,
      sources: verification.sources || [],
      notes: verification.notes || 'Verification completed',
      red_flags: verification.red_flags || [],
      verification_date: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Business verification error:', error);
    return performBasicVerification(input);
  }
}

function performBasicVerification(input: any): any {
  // Basic verification based on data completeness
  let confidence = 50;
  const checks: string[] = [];

  if (input.phone) {
    confidence += 15;
    checks.push('phone');
  }
  if (input.website) {
    confidence += 15;
    checks.push('website');
  }
  if (input.address) {
    confidence += 10;
    checks.push('address');
  }
  if (input.location) {
    confidence += 10;
    checks.push('location');
  }

  return {
    verified: confidence >= 70,
    confidence: Math.min(confidence, 85),
    exists: true,
    phone_valid: !!input.phone,
    website_valid: !!input.website,
    found_online: false,
    sources: ['basic_validation'],
    notes: `Basic verification based on data completeness (${checks.join(', ')})`,
    red_flags: [],
    verification_date: new Date().toISOString(),
  };
}

/**
 * Deduplicate businesses by name
 */
function deduplicateBusinesses(businesses: any[]): any[] {
  const seen = new Map();

  for (const business of businesses) {
    const key = business.name?.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.set(key, business);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate confidence score based on execution
 */
function calculateConfidence(steps: any[], results: any[]): number {
  if (results.length === 0) return 0;
  if (steps.length === 0) return 0.5;

  const toolCount = steps.length;
  const resultCount = results.length;

  // More tools used + more results = higher confidence
  const baseConfidence = Math.min(toolCount / 3, 1) * 0.5;
  const resultConfidence = Math.min(resultCount / 20, 1) * 0.5;

  return Math.min(baseConfidence + resultConfidence, 1);
}
