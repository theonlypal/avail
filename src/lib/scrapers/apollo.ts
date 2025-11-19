/**
 * Apollo.io Integration
 * Finds B2B contacts, email addresses, and phone numbers
 * Free tier: 10 email credits/month, unlimited searches
 * Paid: Starting at $39/month
 */

import type { Lead } from "@/types";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE_URL = "https://api.apollo.io/v1";

interface ApolloSearchParams {
  industry?: string;
  location?: string;
  organizationNumEmployeesRanges?: string[];
  limit?: number;
}

interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string | null;
  phone: string | null;
  primary_domain: string | null;
  industry: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  primary_phone: {
    number: string;
  } | null;
  organization_raw_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  estimated_num_employees: number;
  retail_location_count: number;
  raw_address: string | null;
}

interface ApolloSearchResponse {
  organizations: ApolloOrganization[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
  };
}

/**
 * Search for organizations using Apollo.io People Search API
 */
export async function searchApolloOrganizations(
  params: ApolloSearchParams
): Promise<Lead[]> {
  if (!APOLLO_API_KEY) {
    console.warn("APOLLO_API_KEY not configured. Skipping Apollo.io search.");
    return [];
  }

  try {
    const searchPayload = {
      api_key: APOLLO_API_KEY,
      page: 1,
      per_page: params.limit || 20,
      organization_locations: params.location ? [params.location] : undefined,
      organization_industry_tag_ids: params.industry
        ? [await getIndustryTagId(params.industry)]
        : undefined,
      organization_num_employees_ranges: params.organizationNumEmployeesRanges || [
        "1,10",
        "11,50",
        "51,200",
      ],
    };

    const response = await fetch(`${APOLLO_BASE_URL}/mixed_companies/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo.io API error (${response.status}):`, errorText);
      return [];
    }

    const data: ApolloSearchResponse = await response.json();

    return data.organizations.map((org) => apolloOrgToLead(org, params.industry));
  } catch (error) {
    console.error("Apollo.io search error:", error);
    return [];
  }
}

/**
 * Convert Apollo organization to Lead format
 */
function apolloOrgToLead(org: ApolloOrganization, industry?: string): Lead {
  const location =
    org.organization_raw_address ||
    [org.city, org.state].filter(Boolean).join(", ") ||
    org.country ||
    "Unknown";

  // Generate a unique ID from Apollo organization ID
  const leadId = `apollo-${org.id}`;

  // Build social presence string
  const socialPresence = [
    org.linkedin_url ? "LinkedIn" : null,
    org.twitter_url ? "Twitter" : null,
    org.facebook_url ? "Facebook" : null,
  ]
    .filter(Boolean)
    .join(", ") || null;

  return {
    id: leadId,
    business_name: org.name,
    industry: org.industry || industry || "Unknown",
    location: location,
    phone: org.primary_phone?.number || org.phone || null,
    email: null, // Apollo requires separate enrichment call for emails
    website: org.website_url || org.primary_domain || null,
    rating: 0, // Apollo doesn't provide ratings
    review_count: 0,
    website_score: org.website_url ? 75 : 25, // Estimate based on presence
    social_presence: socialPresence,
    ad_presence: false, // Would require additional analysis
    opportunity_score: calculateApolloOpportunityScore(org),
    pain_points: inferPainPointsFromApollo(org),
    recommended_services: [],
    ai_summary: null,
    lat: null, // Apollo doesn't provide coordinates
    lng: null,
    added_by: null,
    created_at: new Date().toISOString(),
    source: "apollo",
  };
}

/**
 * Calculate opportunity score based on Apollo data
 */
function calculateApolloOpportunityScore(org: ApolloOrganization): number {
  let score = 50; // Base score

  // Has website
  if (org.website_url || org.primary_domain) score += 15;

  // Has phone
  if (org.primary_phone?.number || org.phone) score += 10;

  // Social presence
  if (org.linkedin_url) score += 10;
  if (org.twitter_url) score += 5;
  if (org.facebook_url) score += 5;

  // Company size (SMBs are better targets for many agencies)
  if (org.estimated_num_employees >= 10 && org.estimated_num_employees <= 200) {
    score += 15;
  } else if (org.estimated_num_employees > 200) {
    score += 5; // Enterprise may be harder to reach
  }

  // Multiple locations indicate established business
  if (org.retail_location_count > 1) score += 10;

  return Math.min(score, 100);
}

/**
 * Infer pain points from Apollo organization data
 */
function inferPainPointsFromApollo(org: ApolloOrganization): string[] {
  const painPoints: string[] = [];

  if (!org.website_url && !org.primary_domain) {
    painPoints.push("No website presence");
  }

  if (!org.linkedin_url) {
    painPoints.push("Missing LinkedIn presence");
  }

  if (!org.phone && !org.primary_phone) {
    painPoints.push("No phone number listed");
  }

  if (!org.twitter_url && !org.facebook_url) {
    painPoints.push("Limited social media presence");
  }

  if (org.estimated_num_employees < 10) {
    painPoints.push("Small team - may need automation");
  }

  return painPoints;
}

/**
 * Get Apollo industry tag ID from industry name
 * This is a simplified mapping - Apollo has ~100+ industry tags
 */
async function getIndustryTagId(industryName: string): Promise<string> {
  const industryMap: Record<string, string> = {
    "dental clinics": "5567cd4773696439b10b0000", // Healthcare
    "auto repair": "5567cd4773696439b1090000", // Automotive
    "real estate": "5567cd4773696439b1270000", // Real Estate
    "restaurants": "5567cd4773696439b1110000", // Food & Beverage
    "legal services": "5567cd4773696439b11f0000", // Legal
    "home cleaning": "5567cd4773696439b1190000", // Consumer Services
    construction: "5567cd4773696439b10f0000", // Construction
    plumbing: "5567cd4773696439b1190000", // Consumer Services
    hvac: "5567cd4773696439b1190000", // Consumer Services
    landscaping: "5567cd4773696439b1190000", // Consumer Services
  };

  const normalized = industryName.toLowerCase().trim();
  return industryMap[normalized] || "5567cd4773696439b1190000"; // Default to Consumer Services
}

/**
 * Enrich a lead with email addresses from Apollo
 * Uses Apollo's People Enrichment API
 */
export async function enrichLeadWithApolloEmail(
  businessName: string,
  domain: string
): Promise<{ email: string; title: string; name: string } | null> {
  if (!APOLLO_API_KEY) {
    console.warn("APOLLO_API_KEY not configured. Skipping email enrichment.");
    return null;
  }

  try {
    const response = await fetch(`${APOLLO_BASE_URL}/people/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        api_key: APOLLO_API_KEY,
        organization_name: businessName,
        domain: domain,
        reveal_personal_emails: true,
      }),
    });

    if (!response.ok) {
      console.error(`Apollo email enrichment failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.person && data.person.email) {
      return {
        email: data.person.email,
        title: data.person.title || "Contact",
        name: data.person.name || "Unknown",
      };
    }

    return null;
  } catch (error) {
    console.error("Apollo email enrichment error:", error);
    return null;
  }
}
