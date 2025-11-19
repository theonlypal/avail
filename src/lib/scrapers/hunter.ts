/**
 * Hunter.io Integration
 * Email finder and verification service
 * Free tier: 25 searches/month
 * Paid: Starting at $49/month
 */

import type { Lead } from "@/types";

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const HUNTER_BASE_URL = "https://api.hunter.io/v2";

interface HunterDomainSearchResponse {
  data: {
    domain: string;
    disposable: boolean;
    webmail: boolean;
    accept_all: boolean;
    pattern: string | null;
    organization: string | null;
    emails: Array<{
      value: string;
      type: string;
      confidence: number;
      first_name: string | null;
      last_name: string | null;
      position: string | null;
      seniority: string | null;
      department: string | null;
      linkedin: string | null;
      twitter: string | null;
      phone_number: string | null;
    }>;
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
    params: {
      domain: string;
      company: string | null;
    };
  };
}

interface HunterEmailFinderResponse {
  data: {
    first_name: string;
    last_name: string;
    email: string | null;
    score: number;
    domain: string;
    accept_all: boolean;
    position: string | null;
    twitter: string | null;
    linkedin_url: string | null;
    phone_number: string | null;
    company: string | null;
  };
  meta: {
    params: {
      first_name: string;
      last_name: string;
      full_name: string | null;
      domain: string;
      company: string | null;
    };
  };
}

interface HunterEmailVerifyResponse {
  data: {
    status: "valid" | "invalid" | "accept_all" | "unknown" | "disposable" | "webmail";
    result: "deliverable" | "undeliverable" | "risky" | "unknown";
    score: number;
    email: string;
    regexp: boolean;
    gibberish: boolean;
    disposable: boolean;
    webmail: boolean;
    mx_records: boolean;
    smtp_server: boolean;
    smtp_check: boolean;
    accept_all: boolean;
    block: boolean;
  };
}

/**
 * Find all email addresses associated with a domain
 */
export async function findEmailsByDomain(
  domain: string,
  companyName?: string
): Promise<Array<{ email: string; name: string; position: string; confidence: number }>> {
  if (!HUNTER_API_KEY) {
    console.warn("HUNTER_API_KEY not configured. Skipping Hunter.io search.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      domain: domain,
      api_key: HUNTER_API_KEY,
      limit: "10",
    });

    if (companyName) {
      params.append("company", companyName);
    }

    const response = await fetch(`${HUNTER_BASE_URL}/domain-search?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hunter.io domain search error (${response.status}):`, errorText);
      return [];
    }

    const data: HunterDomainSearchResponse = await response.json();

    return data.data.emails
      .filter((email) => email.confidence > 50) // Only return emails with >50% confidence
      .map((email) => ({
        email: email.value,
        name: [email.first_name, email.last_name].filter(Boolean).join(" ") || "Unknown",
        position: email.position || "Contact",
        confidence: email.confidence,
      }));
  } catch (error) {
    console.error("Hunter.io domain search error:", error);
    return [];
  }
}

/**
 * Find a specific person's email address
 */
export async function findEmailByName(
  domain: string,
  firstName: string,
  lastName: string,
  companyName?: string
): Promise<{ email: string; confidence: number; position: string } | null> {
  if (!HUNTER_API_KEY) {
    console.warn("HUNTER_API_KEY not configured. Skipping Hunter.io email finder.");
    return null;
  }

  try {
    const params = new URLSearchParams({
      domain: domain,
      first_name: firstName,
      last_name: lastName,
      api_key: HUNTER_API_KEY,
    });

    if (companyName) {
      params.append("company", companyName);
    }

    const response = await fetch(`${HUNTER_BASE_URL}/email-finder?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Hunter.io email finder error: ${response.status}`);
      return null;
    }

    const data: HunterEmailFinderResponse = await response.json();

    if (data.data.email && data.data.score > 50) {
      return {
        email: data.data.email,
        confidence: data.data.score,
        position: data.data.position || "Contact",
      };
    }

    return null;
  } catch (error) {
    console.error("Hunter.io email finder error:", error);
    return null;
  }
}

/**
 * Verify if an email address is valid and deliverable
 */
export async function verifyEmail(email: string): Promise<{
  valid: boolean;
  score: number;
  status: string;
  deliverable: boolean;
}> {
  if (!HUNTER_API_KEY) {
    console.warn("HUNTER_API_KEY not configured. Skipping email verification.");
    return { valid: false, score: 0, status: "unknown", deliverable: false };
  }

  try {
    const params = new URLSearchParams({
      email: email,
      api_key: HUNTER_API_KEY,
    });

    const response = await fetch(`${HUNTER_BASE_URL}/email-verifier?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Hunter.io email verification error: ${response.status}`);
      return { valid: false, score: 0, status: "unknown", deliverable: false };
    }

    const data: HunterEmailVerifyResponse = await response.json();

    return {
      valid: data.data.status === "valid",
      score: data.data.score,
      status: data.data.status,
      deliverable: data.data.result === "deliverable",
    };
  } catch (error) {
    console.error("Hunter.io email verification error:", error);
    return { valid: false, score: 0, status: "unknown", deliverable: false };
  }
}

/**
 * Enrich existing leads with email addresses from Hunter.io
 */
export async function enrichLeadWithHunterEmail(lead: Lead): Promise<Lead> {
  if (!lead.website) {
    return lead;
  }

  try {
    // Extract domain from website URL
    const domain = extractDomain(lead.website);
    if (!domain) return lead;

    // Search for emails at this domain
    const emails = await findEmailsByDomain(domain, lead.business_name);

    if (emails.length > 0) {
      // Use the highest confidence email
      const bestEmail = emails.reduce((prev, current) =>
        prev.confidence > current.confidence ? prev : current
      );

      return {
        ...lead,
        email: bestEmail.email,
        enriched_at: new Date().toISOString(),
      };
    }

    return lead;
  } catch (error) {
    console.error("Hunter.io lead enrichment error:", error);
    return lead;
  }
}

/**
 * Extract domain from website URL
 */
function extractDomain(url: string): string | null {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    return parsed.hostname.replace("www.", "");
  } catch (error) {
    console.error("Failed to extract domain from URL:", url);
    return null;
  }
}

/**
 * Batch enrich multiple leads with email addresses
 */
export async function batchEnrichLeadsWithEmails(leads: Lead[]): Promise<Lead[]> {
  if (!HUNTER_API_KEY) {
    console.warn("HUNTER_API_KEY not configured. Skipping batch email enrichment.");
    return leads;
  }

  // Hunter.io has rate limits - process sequentially with delay
  const enrichedLeads: Lead[] = [];

  for (const lead of leads) {
    const enriched = await enrichLeadWithHunterEmail(lead);
    enrichedLeads.push(enriched);

    // Small delay to respect rate limits (free tier: 25 requests/month)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return enrichedLeads;
}

/**
 * Get Hunter.io account information (remaining credits, etc.)
 */
export async function getHunterAccountInfo(): Promise<{
  remaining: number;
  limit: number;
  used: number;
} | null> {
  if (!HUNTER_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${HUNTER_BASE_URL}/account?api_key=${HUNTER_API_KEY}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Hunter.io account info error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      remaining: data.data.requests.searches.available,
      limit: data.data.requests.searches.available + data.data.requests.searches.used,
      used: data.data.requests.searches.used,
    };
  } catch (error) {
    console.error("Hunter.io account info error:", error);
    return null;
  }
}
