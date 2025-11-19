/**
 * Scraping Orchestrator
 * Alien-level intelligence for multi-source lead discovery
 *
 * Intelligently routes scraping requests across multiple sources:
 * - Google Maps (local businesses with reviews)
 * - Yelp (local businesses with ratings)
 * - Apollo.io (B2B contacts and company data)
 * - Hunter.io (email enrichment)
 * - Puppeteer (direct website scraping)
 *
 * Features:
 * - Parallel scraping from all sources
 * - Intelligent deduplication
 * - Quality scoring and ranking
 * - Automatic fallback on failures
 * - Rate limit management
 */

import type { Lead } from "@/types";
import { searchApolloOrganizations, enrichLeadWithApolloEmail } from "./scrapers/apollo";
import { enrichLeadWithHunterEmail, findEmailsByDomain } from "./scrapers/hunter";
import { scrapeBusinessWebsite, enrichLeadWithWebscraping } from "./scrapers/puppeteer";

export interface ScrapingStrategy {
  sources: ("google" | "yelp" | "apollo" | "web")[];
  enrichWithEmails: boolean;
  enrichWithWebscraping: boolean;
  maxLeads: number;
  deduplicateBy: ("name" | "website" | "phone")[];
  sortBy: "opportunity_score" | "rating" | "review_count";
}

export interface ScrapingResult {
  leads: Lead[];
  sources_used: string[];
  total_found: number;
  deduplication_removed: number;
  enrichment_stats: {
    emails_found: number;
    websites_scraped: number;
  };
  errors: Array<{ source: string; message: string }>;
}

/**
 * Get optimal scraping strategy based on industry and location
 */
export function getScrapingStrategy(industry: string, location: string): ScrapingStrategy {
  const industryLower = industry.toLowerCase();

  // B2B industries - prioritize Apollo + email enrichment
  const b2bIndustries = [
    "software",
    "saas",
    "consulting",
    "marketing agency",
    "legal services",
    "accounting",
    "financial services",
    "it services",
  ];

  const isB2B = b2bIndustries.some((b2b) => industryLower.includes(b2b));

  if (isB2B) {
    return {
      sources: ["apollo", "google", "yelp"],
      enrichWithEmails: true,
      enrichWithWebscraping: true,
      maxLeads: 50,
      deduplicateBy: ["website", "name"],
      sortBy: "opportunity_score",
    };
  }

  // Local service businesses - prioritize Google Maps + Yelp
  const localIndustries = [
    "restaurant",
    "dental",
    "auto repair",
    "plumbing",
    "hvac",
    "cleaning",
    "landscaping",
    "real estate",
  ];

  const isLocal = localIndustries.some((local) => industryLower.includes(local));

  if (isLocal) {
    return {
      sources: ["google", "yelp", "apollo"],
      enrichWithEmails: true,
      enrichWithWebscraping: false, // Less useful for local businesses
      maxLeads: 100,
      deduplicateBy: ["phone", "name"],
      sortBy: "rating",
    };
  }

  // Default strategy - balanced approach
  return {
    sources: ["google", "yelp", "apollo"],
    enrichWithEmails: true,
    enrichWithWebscraping: true,
    maxLeads: 50,
    deduplicateBy: ["name", "website"],
    sortBy: "opportunity_score",
  };
}

/**
 * Execute multi-source scraping with intelligent orchestration
 */
export async function orchestrateLeadScraping(
  industry: string,
  location: string,
  customStrategy?: Partial<ScrapingStrategy>
): Promise<ScrapingResult> {
  // Get optimal strategy or use custom
  const defaultStrategy = getScrapingStrategy(industry, location);
  const strategy: ScrapingStrategy = {
    ...defaultStrategy,
    ...customStrategy,
  };

  const leads: Lead[] = [];
  const sourcesUsed: string[] = [];
  const errors: Array<{ source: string; message: string }> = [];
  let emailsFound = 0;
  let websitesScraped = 0;

  console.log(`[Scraping Orchestrator] Starting scrape with strategy:`, strategy);

  // Execute all scraping sources in parallel
  const scrapingPromises: Promise<void>[] = [];

  // Google Maps + Yelp (via existing API route)
  if (strategy.sources.includes("google") || strategy.sources.includes("yelp")) {
    scrapingPromises.push(
      (async () => {
        try {
          const response = await fetch("/api/leads/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              industry,
              city: location,
              limit: Math.ceil(strategy.maxLeads / strategy.sources.length),
              sources: strategy.sources.filter((s) => s === "google" || s === "yelp"),
              enrichWithEmails: false, // We'll handle enrichment separately
            }),
          });

          if (response.ok) {
            const data = await response.json();
            leads.push(...data.leads);
            sourcesUsed.push(...data.sources);
          } else {
            errors.push({
              source: "google/yelp",
              message: `API returned ${response.status}`,
            });
          }
        } catch (error) {
          errors.push({
            source: "google/yelp",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      })()
    );
  }

  // Apollo.io
  if (strategy.sources.includes("apollo")) {
    scrapingPromises.push(
      (async () => {
        try {
          const apolloLeads = await searchApolloOrganizations({
            industry,
            location,
            limit: Math.ceil(strategy.maxLeads / strategy.sources.length),
          });

          if (apolloLeads.length > 0) {
            leads.push(...apolloLeads);
            sourcesUsed.push("apollo");
          }
        } catch (error) {
          errors.push({
            source: "apollo",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      })()
    );
  }

  // Wait for all scraping to complete
  await Promise.all(scrapingPromises);

  console.log(`[Scraping Orchestrator] Raw leads collected: ${leads.length}`);

  // Deduplicate leads
  const beforeDedup = leads.length;
  const uniqueLeads = deduplicateLeads(leads, strategy.deduplicateBy);
  const deduplicationRemoved = beforeDedup - uniqueLeads.length;

  console.log(`[Scraping Orchestrator] After deduplication: ${uniqueLeads.length} leads`);

  // Email enrichment (Hunter.io + Apollo.io)
  if (strategy.enrichWithEmails && uniqueLeads.length > 0) {
    console.log(`[Scraping Orchestrator] Starting email enrichment...`);

    const enrichmentPromises = uniqueLeads
      .filter((lead) => !lead.email && lead.website) // Only enrich leads missing emails
      .slice(0, 10) // Limit to 10 to respect rate limits
      .map(async (lead) => {
        try {
          // Try Hunter.io first
          const enriched = await enrichLeadWithHunterEmail(lead);

          if (enriched.email) {
            emailsFound++;
            return enriched;
          }

          // Fallback to Apollo.io if we have domain
          if (lead.website) {
            const domain = extractDomain(lead.website);
            if (domain) {
              const apolloEmail = await enrichLeadWithApolloEmail(lead.business_name, domain);
              if (apolloEmail?.email) {
                emailsFound++;
                return {
                  ...lead,
                  email: apolloEmail.email,
                  enriched_at: new Date().toISOString(),
                };
              }
            }
          }

          return lead;
        } catch (error) {
          console.error(`Email enrichment failed for ${lead.business_name}:`, error);
          return lead;
        }
      });

    const enrichedLeads = await Promise.all(enrichmentPromises);

    // Merge enriched leads back
    const enrichedMap = new Map(enrichedLeads.map((lead) => [lead.id, lead]));
    uniqueLeads.forEach((lead, index) => {
      const enriched = enrichedMap.get(lead.id);
      if (enriched) {
        uniqueLeads[index] = enriched;
      }
    });

    console.log(`[Scraping Orchestrator] Emails found: ${emailsFound}`);
  }

  // Web scraping enrichment (Puppeteer)
  if (strategy.enrichWithWebscraping && uniqueLeads.length > 0) {
    console.log(`[Scraping Orchestrator] Starting web scraping enrichment...`);

    const scrapingPromises = uniqueLeads
      .filter((lead) => lead.website && (!lead.email || !lead.phone)) // Only scrape if missing data
      .slice(0, 5) // Limit to 5 to avoid overwhelming the system
      .map(async (lead) => {
        try {
          const enriched = await enrichLeadWithWebscraping(lead);
          websitesScraped++;
          return enriched;
        } catch (error) {
          console.error(`Web scraping failed for ${lead.business_name}:`, error);
          return lead;
        }
      });

    const scrapedLeads = await Promise.all(scrapingPromises);

    // Merge scraped leads back
    const scrapedMap = new Map(scrapedLeads.map((lead) => [lead.id, lead]));
    uniqueLeads.forEach((lead, index) => {
      const scraped = scrapedMap.get(lead.id);
      if (scraped) {
        uniqueLeads[index] = scraped;
      }
    });

    console.log(`[Scraping Orchestrator] Websites scraped: ${websitesScraped}`);
  }

  // Sort by strategy
  uniqueLeads.sort((a, b) => {
    switch (strategy.sortBy) {
      case "opportunity_score":
        return b.opportunity_score - a.opportunity_score;
      case "rating":
        return b.rating - a.rating;
      case "review_count":
        return b.review_count - a.review_count;
      default:
        return 0;
    }
  });

  // Limit to max leads
  const finalLeads = uniqueLeads.slice(0, strategy.maxLeads);

  console.log(`[Scraping Orchestrator] Final leads: ${finalLeads.length}`);

  return {
    leads: finalLeads,
    sources_used: [...new Set(sourcesUsed)],
    total_found: uniqueLeads.length,
    deduplication_removed: deduplicationRemoved,
    enrichment_stats: {
      emails_found: emailsFound,
      websites_scraped: websitesScraped,
    },
    errors,
  };
}

/**
 * Deduplicate leads based on specified fields
 */
function deduplicateLeads(
  leads: Lead[],
  deduplicateBy: ("name" | "website" | "phone")[]
): Lead[] {
  const seen = new Set<string>();
  const unique: Lead[] = [];

  for (const lead of leads) {
    let key = "";

    // Build deduplication key
    if (deduplicateBy.includes("name")) {
      key += lead.business_name.toLowerCase().trim();
    }

    if (deduplicateBy.includes("website") && lead.website) {
      key += `|${extractDomain(lead.website) || lead.website.toLowerCase()}`;
    }

    if (deduplicateBy.includes("phone") && lead.phone) {
      key += `|${normalizePhone(lead.phone)}`;
    }

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(lead);
    }
  }

  return unique;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    return parsed.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, ""); // Remove all non-digits
}

/**
 * Get recommended enrichment strategy for a batch of leads
 */
export function recommendEnrichmentStrategy(leads: Lead[]): {
  needsEmailEnrichment: Lead[];
  needsWebscraping: Lead[];
  needsScoring: Lead[];
} {
  return {
    needsEmailEnrichment: leads.filter((lead) => !lead.email && lead.website),
    needsWebscraping: leads.filter(
      (lead) => lead.website && (!lead.phone || !lead.email || !lead.social_presence)
    ),
    needsScoring: leads.filter((lead) => !lead.scored_at),
  };
}
