/**
 * Advanced Web Scraper with Multi-Source Integration
 * Combines Google Custom Search, Yelp, and web scraping for comprehensive lead discovery
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ScrapedBusiness {
  name: string;
  industry: string;
  location: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  address?: string;
  lat?: number;
  lng?: number;
  source: string;
}

export interface SearchOptions {
  industry: string;
  location: string;
  limit: number;
  filters?: {
    maxRating?: number;
    minRating?: number;
    hasWebsite?: boolean;
    minReviews?: number;
    maxReviews?: number;
  };
}

/**
 * Search using Google Custom Search API
 */
async function searchGoogleCustom(query: string, limit: number): Promise<ScrapedBusiness[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.warn('Google Custom Search not configured');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=${Math.min(limit, 10)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    const businesses: ScrapedBusiness[] = [];

    // Parse search results with AI to extract business information
    if (data.items && data.items.length > 0) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      for (const item of data.items.slice(0, limit)) {
        try {
          const prompt = `Extract business information from this search result:

Title: ${item.title}
Snippet: ${item.snippet}
URL: ${item.link}

Extract and return JSON with:
{
  "name": "business name",
  "phone": "phone number or null",
  "website": "website URL",
  "rating": estimated rating 0-5 or 0,
  "reviewCount": estimated review count or 0,
  "hasContact": true/false
}`;

          const message = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 512,
            messages: [{ role: 'user', content: prompt }],
          });

          const content = message.content[0];
          if (content.type === 'text') {
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const extracted = JSON.parse(jsonMatch[0]);

              businesses.push({
                name: extracted.name || item.title,
                industry: '',
                location: '',
                city: '',
                state: '',
                phone: extracted.phone,
                website: extracted.website || item.link,
                rating: extracted.rating || 0,
                reviewCount: extracted.reviewCount || 0,
                source: 'google_search',
              });
            }
          }
        } catch (error) {
          console.error('Error parsing search result:', error);
        }
      }
    }

    return businesses;
  } catch (error) {
    console.error('Google Custom Search error:', error);
    return [];
  }
}

/**
 * Search using Yelp Fusion API
 */
async function searchYelp(options: SearchOptions): Promise<ScrapedBusiness[]> {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    console.warn('Yelp API not configured');
    return [];
  }

  try {
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(options.industry)}&location=${encodeURIComponent(options.location)}&limit=${Math.min(options.limit, 50)}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    const data = await response.json();
    const businesses: ScrapedBusiness[] = [];

    for (const biz of data.businesses || []) {
      // Apply filters
      if (options.filters?.maxRating && biz.rating > options.filters.maxRating) continue;
      if (options.filters?.minRating && biz.rating < options.filters.minRating) continue;
      if (options.filters?.minReviews && biz.review_count < options.filters.minReviews) continue;
      if (options.filters?.maxReviews && biz.review_count > options.filters.maxReviews) continue;

      businesses.push({
        name: biz.name,
        industry: options.industry,
        location: options.location,
        city: biz.location?.city || '',
        state: biz.location?.state || '',
        phone: biz.phone,
        website: biz.url,
        rating: biz.rating || 0,
        reviewCount: biz.review_count || 0,
        address: biz.location?.address1 || '',
        lat: biz.coordinates?.latitude,
        lng: biz.coordinates?.longitude,
        source: 'yelp',
      });
    }

    return businesses;
  } catch (error) {
    console.error('Yelp search error:', error);
    return [];
  }
}

/**
 * Search using Google Maps Places API
 */
async function searchGoogleMaps(options: SearchOptions): Promise<ScrapedBusiness[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('Google Maps API not configured');
    return [];
  }

  try {
    const query = `${options.industry} in ${options.location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API returned status: ${data.status}`);
    }

    const businesses: ScrapedBusiness[] = [];

    for (const place of (data.results || []).slice(0, options.limit)) {
      // Get detailed place information
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry&key=${apiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      if (details.status === 'OK' && details.result) {
        const result = details.result;
        const rating = result.rating || 0;
        const reviewCount = result.user_ratings_total || 0;

        // Apply filters
        if (options.filters?.maxRating && rating > options.filters.maxRating) continue;
        if (options.filters?.minRating && rating < options.filters.minRating) continue;
        if (options.filters?.minReviews && reviewCount < options.filters.minReviews) continue;
        if (options.filters?.maxReviews && reviewCount > options.filters.maxReviews) continue;
        if (options.filters?.hasWebsite === false && result.website) continue;

        const addressParts = result.formatted_address?.split(',') || [];

        businesses.push({
          name: result.name,
          industry: options.industry,
          location: options.location,
          city: addressParts[addressParts.length - 3]?.trim() || '',
          state: addressParts[addressParts.length - 2]?.trim().split(' ')[0] || '',
          phone: result.formatted_phone_number,
          website: result.website,
          rating,
          reviewCount,
          address: result.formatted_address,
          lat: result.geometry?.location?.lat,
          lng: result.geometry?.location?.lng,
          source: 'google_maps',
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return businesses;
  } catch (error) {
    console.error('Google Maps search error:', error);
    return [];
  }
}

/**
 * Enrich business with email using Hunter.io
 */
async function enrichWithHunter(business: ScrapedBusiness): Promise<string | null> {
  const apiKey = process.env.HUNTER_API_KEY;

  if (!apiKey || !business.website) {
    return null;
  }

  try {
    const domain = new URL(business.website).hostname;
    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.data?.emails && data.data.emails.length > 0) {
      return data.data.emails[0].value;
    }

    return null;
  } catch (error) {
    console.error('Hunter.io enrichment error:', error);
    return null;
  }
}

/**
 * Enrich business with email using Apollo.io
 */
async function enrichWithApollo(business: ScrapedBusiness): Promise<string | null> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey || !business.website) {
    return null;
  }

  try {
    const domain = new URL(business.website).hostname;
    const url = 'https://api.apollo.io/v1/people/match';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        domain,
        organization_name: business.name,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.person?.email) {
      return data.person.email;
    }

    return null;
  } catch (error) {
    console.error('Apollo.io enrichment error:', error);
    return null;
  }
}

/**
 * Main search function that combines all sources
 */
export async function searchBusinesses(options: SearchOptions, enrichEmails: boolean = false): Promise<ScrapedBusiness[]> {
  console.log('🔍 Starting multi-source business search...');
  console.log('Options:', options);

  const allBusinesses: ScrapedBusiness[] = [];
  const perSource = Math.ceil(options.limit / 3);

  // Search from multiple sources in parallel
  const [googleMapsResults, yelpResults] = await Promise.all([
    searchGoogleMaps({ ...options, limit: perSource }),
    searchYelp({ ...options, limit: perSource }),
  ]);

  allBusinesses.push(...googleMapsResults);
  allBusinesses.push(...yelpResults);

  // Deduplicate by name (case-insensitive)
  const uniqueBusinesses = Array.from(
    new Map(
      allBusinesses.map(b => [b.name.toLowerCase().trim(), b])
    ).values()
  );

  console.log(`📊 Found ${uniqueBusinesses.length} unique businesses from ${allBusinesses.length} total results`);

  // Enrich with emails if requested
  if (enrichEmails) {
    console.log('📧 Enriching with email addresses...');

    for (const business of uniqueBusinesses) {
      if (!business.email && business.website) {
        // Try Hunter.io first
        const hunterEmail = await enrichWithHunter(business);
        if (hunterEmail) {
          business.email = hunterEmail;
          console.log(`✉️  Found email for ${business.name}: ${hunterEmail}`);
          continue;
        }

        // Try Apollo.io if Hunter failed
        const apolloEmail = await enrichWithApollo(business);
        if (apolloEmail) {
          business.email = apolloEmail;
          console.log(`✉️  Found email for ${business.name}: ${apolloEmail}`);
        }

        // Rate limiting between email enrichment calls
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Ensure all businesses have location data
  for (const business of uniqueBusinesses) {
    business.industry = business.industry || options.industry;
    business.location = business.location || options.location;

    if (!business.city || !business.state) {
      const locationParts = options.location.split(',').map(s => s.trim());
      if (locationParts.length >= 2) {
        business.city = business.city || locationParts[0];
        business.state = business.state || locationParts[1];
      }
    }
  }

  return uniqueBusinesses.slice(0, options.limit);
}

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
