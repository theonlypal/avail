/**
 * Real Lead Scraper - Fetches actual businesses from the internet
 * NO FAKE DATA - Only real businesses with real contact info
 */

import type { Lead } from "@/types";

const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const YELP_SEARCH_URL = "https://api.yelp.com/v3/businesses/search";

interface ScrapedBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  industry: string;
  source: string;
}

/**
 * Scrape real businesses from Google Places API
 */
async function scrapeGooglePlaces(
  industry: string,
  city: string,
  limit: number = 20
): Promise<ScrapedBusiness[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not found');
    return [];
  }

  try {
    const query = `${industry} in ${city}`;
    const url = `${GOOGLE_PLACES_URL}?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    const businesses: ScrapedBusiness[] = [];
    const results = data.results || [];

    for (const place of results.slice(0, limit)) {
      // Get detailed place info
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry&key=${apiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      if (details.status === 'OK' && details.result) {
        const result = details.result;
        const addressParts = result.formatted_address?.split(',') || [];

        businesses.push({
          name: result.name,
          address: result.formatted_address || '',
          city: addressParts[addressParts.length - 3]?.trim() || city,
          state: addressParts[addressParts.length - 2]?.trim().split(' ')[0] || '',
          phone: result.formatted_phone_number,
          website: result.website,
          rating: result.rating || 0,
          reviewCount: result.user_ratings_total || 0,
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0,
          industry,
          source: 'google',
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return businesses;
  } catch (error) {
    console.error('Google Places scraping error:', error);
    return [];
  }
}

/**
 * Scrape real businesses from Yelp API
 */
async function scrapeYelp(
  industry: string,
  city: string,
  limit: number = 20
): Promise<ScrapedBusiness[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    console.warn('Yelp API key not found');
    return [];
  }

  try {
    const url = `${YELP_SEARCH_URL}?term=${encodeURIComponent(industry)}&location=${encodeURIComponent(city)}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    const data = await response.json();
    const businesses: ScrapedBusiness[] = [];

    for (const biz of data.businesses || []) {
      businesses.push({
        name: biz.name,
        address: biz.location?.address1 || '',
        city: biz.location?.city || city,
        state: biz.location?.state || '',
        phone: biz.phone,
        website: biz.url, // Yelp URL
        rating: biz.rating || 0,
        reviewCount: biz.review_count || 0,
        lat: biz.coordinates?.latitude || 0,
        lng: biz.coordinates?.longitude || 0,
        industry: biz.categories?.[0]?.title || industry,
        source: 'yelp',
      });
    }

    return businesses;
  } catch (error) {
    console.error('Yelp scraping error:', error);
    return [];
  }
}

/**
 * Convert scraped business to Lead format
 */
function scrapedToLead(business: ScrapedBusiness, teamId: string): Lead {
  // Calculate opportunity score based on real metrics
  let opportunityScore = 50; // Base score

  // Adjust based on review count (more reviews = more established)
  if (business.reviewCount > 200) opportunityScore += 15;
  else if (business.reviewCount > 100) opportunityScore += 10;
  else if (business.reviewCount > 50) opportunityScore += 5;

  // Adjust based on rating (lower rating = more opportunity for improvement)
  if (business.rating < 4.0 && business.reviewCount > 20) opportunityScore += 20;
  else if (business.rating < 4.5 && business.reviewCount > 50) opportunityScore += 10;

  // Boost for missing website
  if (!business.website) opportunityScore += 15;

  // Cap at 95
  opportunityScore = Math.min(opportunityScore, 95);

  // Generate pain points based on real data
  const painPoints: string[] = [];
  if (!business.website || business.website.includes('yelp.com')) {
    painPoints.push('No dedicated website');
  }
  if (business.rating < 4.0 && business.reviewCount > 10) {
    painPoints.push('Low online ratings need improvement');
  }
  if (business.reviewCount < 50) {
    painPoints.push('Limited online presence');
  }
  if (!business.phone) {
    painPoints.push('Missing online contact information');
  }

  // Generate recommended services
  const services: string[] = [];
  if (!business.website || business.website.includes('yelp.com')) {
    services.push('Website Development');
  }
  if (business.rating < 4.5) {
    services.push('Review Management');
  }
  if (business.reviewCount < 100) {
    services.push('Local SEO & Marketing');
  }
  services.push('AI Chat Widget');

  // Generate AI summary
  const aiSummary = `${business.name} is a ${business.industry} business in ${business.city}, ${business.state} with ${business.rating.toFixed(1)} stars from ${business.reviewCount} reviews. ${
    painPoints.length > 0 ? `Key opportunities: ${painPoints.slice(0, 2).join(', ')}.` : 'Well-established business with growth potential.'
  }`;

  return {
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    business_name: business.name,
    industry: business.industry,
    location: `${business.city}, ${business.state}`,
    phone: business.phone || null,
    email: null, // Real email would require additional enrichment
    website: business.website && !business.website.includes('yelp.com') ? business.website : null,
    rating: business.rating,
    review_count: business.reviewCount,
    website_score: business.website && !business.website.includes('yelp.com') ? 70 : 0,
    social_presence: null, // Would require additional API calls
    ad_presence: false, // Would require ad network checks
    opportunity_score: opportunityScore,
    pain_points: painPoints,
    recommended_services: services,
    ai_summary: aiSummary,
    lat: business.lat,
    lng: business.lng,
    added_by: null,
    source: business.source,
    created_at: new Date().toISOString(),
  };
}

export interface ScrapeOptions {
  industry?: string;
  city?: string;
  limit?: number;
}

/**
 * Scrape 100 real businesses from the internet
 */
export async function scrapeRealLeads(
  teamId: string,
  options?: ScrapeOptions
): Promise<Lead[]> {
  console.log('🌐 Starting real business scraping from the internet...');

  const allLeads: Lead[] = [];

  // If specific search requested, use that
  if (options?.industry && options?.city) {
    console.log(`Targeted search: ${options.industry} in ${options.city}`);
    const limit = options.limit || 20;

    const googleBusinesses = await scrapeGooglePlaces(options.industry, options.city, Math.ceil(limit / 2));
    const yelpBusinesses = await scrapeYelp(options.industry, options.city, Math.ceil(limit / 2));

    const allBusinesses = [...googleBusinesses, ...yelpBusinesses];
    const uniqueBusinesses = Array.from(
      new Map(allBusinesses.map(b => [b.name.toLowerCase(), b])).values()
    );

    const leads = uniqueBusinesses
      .slice(0, limit)
      .map(business => scrapedToLead(business, teamId));

    return leads;
  }

  // Default: scrape diverse set of businesses across industries and cities
  const searches = [
    { industry: 'HVAC', city: 'San Diego, CA', count: 15 },
    { industry: 'Plumbing', city: 'Phoenix, AZ', count: 15 },
    { industry: 'Dentist', city: 'Austin, TX', count: 10 },
    { industry: 'Law Firm', city: 'Los Angeles, CA', count: 10 },
    { industry: 'Real Estate', city: 'Miami, FL', count: 10 },
    { industry: 'Restaurant', city: 'Chicago, IL', count: 10 },
    { industry: 'Auto Repair', city: 'Dallas, TX', count: 10 },
    { industry: 'Hair Salon', city: 'Seattle, WA', count: 10 },
    { industry: 'Gym', city: 'Atlanta, GA', count: 10 },
  ];

  for (const search of searches) {
    console.log(`Scraping ${search.industry} businesses in ${search.city}...`);

    // Try Google Places first
    const googleBusinesses = await scrapeGooglePlaces(search.industry, search.city, Math.ceil(search.count / 2));

    // Then try Yelp
    const yelpBusinesses = await scrapeYelp(search.industry, search.city, Math.ceil(search.count / 2));

    // Combine and deduplicate by name
    const allBusinesses = [...googleBusinesses, ...yelpBusinesses];
    const uniqueBusinesses = Array.from(
      new Map(allBusinesses.map(b => [b.name.toLowerCase(), b])).values()
    );

    // Convert to leads
    const leads = uniqueBusinesses
      .slice(0, search.count)
      .map(business => scrapedToLead(business, teamId));

    allLeads.push(...leads);

    console.log(`✅ Scraped ${leads.length} real businesses for ${search.industry}`);

    // Rate limiting between searches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`🎉 Completed scraping: ${allLeads.length} total real businesses`);

  return allLeads;
}

/**
 * Save leads to SQLite database
 */
export async function saveLeadsToDb(leads: Lead[], db: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO leads (
      id, team_id, business_name, industry, location,
      phone, email, website, rating, review_count,
      website_score, social_presence, ad_presence,
      opportunity_score, pain_points, recommended_services,
      ai_summary, lat, lng, source, created_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let inserted = 0;
  for (const lead of leads) {
    try {
      stmt.run(
        lead.id,
        lead.team_id || '',
        lead.business_name,
        lead.industry,
        lead.location,
        lead.phone,
        lead.email,
        lead.website,
        lead.rating,
        lead.review_count,
        lead.website_score,
        lead.social_presence,
        lead.ad_presence ? 1 : 0,
        lead.opportunity_score,
        JSON.stringify(lead.pain_points),
        JSON.stringify(lead.recommended_services),
        lead.ai_summary,
        lead.lat,
        lead.lng,
        lead.source,
        lead.created_at
      );
      inserted++;
    } catch (error) {
      console.error(`Failed to insert lead ${lead.business_name}:`, error);
    }
  }

  console.log(`✅ Saved ${inserted}/${leads.length} leads to database`);
  return inserted;
}
