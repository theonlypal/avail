/**
 * Puppeteer Web Scraping Integration
 * Direct website scraping for business data
 * Free (self-hosted) or use Browserless.io ($75/month for hosted)
 */

import type { Lead } from "@/types";

// Puppeteer is conditionally imported to avoid bundling issues in browser
let puppeteer: typeof import("puppeteer") | null = null;

// Browserless.io token (optional - for production use)
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const BROWSERLESS_URL = BROWSERLESS_TOKEN
  ? `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`
  : null;

/**
 * Initialize Puppeteer (lazy load to avoid bundling issues)
 */
async function initPuppeteer() {
  if (!puppeteer) {
    try {
      puppeteer = await import("puppeteer");
    } catch (error) {
      console.error("Failed to import puppeteer:", error);
      throw new Error(
        "Puppeteer not installed. Run: npm install puppeteer OR use BROWSERLESS_TOKEN"
      );
    }
  }
  return puppeteer;
}

interface ScrapedBusinessData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  hasLiveChat?: boolean;
  technologies?: string[];
}

/**
 * Scrape business information from a website
 */
export async function scrapeBusinessWebsite(url: string): Promise<ScrapedBusinessData | null> {
  const pptr = await initPuppeteer();

  let browser = null;

  try {
    // Use Browserless.io if token is available, otherwise use local Puppeteer
    if (BROWSERLESS_URL) {
      browser = await pptr.connect({
        browserWSEndpoint: BROWSERLESS_URL,
      });
    } else {
      browser = await pptr.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });
    }

    const page = await browser.newPage();

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Extract business data from the page
    const businessData = await page.evaluate(() => {
      const data: ScrapedBusinessData = {
        name: document.title || "Unknown Business",
      };

      // Extract phone numbers from text and links
      const phoneRegex = /(\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
      const bodyText = document.body.innerText;
      const phoneMatches = bodyText.match(phoneRegex);
      if (phoneMatches && phoneMatches.length > 0) {
        data.phone = phoneMatches[0].trim();
      }

      // Also check tel: links
      const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
      if (telLinks.length > 0 && !data.phone) {
        const href = (telLinks[0] as HTMLAnchorElement).href;
        data.phone = href.replace("tel:", "").trim();
      }

      // Extract email addresses from text and mailto links
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const emailMatches = bodyText.match(emailRegex);
      if (emailMatches && emailMatches.length > 0) {
        // Filter out common false positives
        const validEmails = emailMatches.filter(
          (email) => !email.includes("example.com") && !email.includes("sentry")
        );
        if (validEmails.length > 0) {
          data.email = validEmails[0].trim();
        }
      }

      // Also check mailto: links
      const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
      if (mailtoLinks.length > 0 && !data.email) {
        const href = (mailtoLinks[0] as HTMLAnchorElement).href;
        data.email = href.replace("mailto:", "").split("?")[0].trim();
      }

      // Extract address from common selectors
      const addressSelectors = [
        '[itemprop="address"]',
        ".address",
        "#address",
        '[class*="location"]',
        '[class*="address"]',
      ];

      for (const selector of addressSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          data.address = element.textContent.trim();
          break;
        }
      }

      // Extract meta description as business description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        data.description = metaDescription.getAttribute("content") || undefined;
      }

      // Extract social media links
      data.socialLinks = {};

      const socialLinkSelectors = {
        facebook: 'a[href*="facebook.com"]',
        twitter: 'a[href*="twitter.com"], a[href*="x.com"]',
        linkedin: 'a[href*="linkedin.com"]',
        instagram: 'a[href*="instagram.com"]',
      };

      for (const [platform, selector] of Object.entries(socialLinkSelectors)) {
        const link = document.querySelector(selector);
        if (link) {
          const href = (link as HTMLAnchorElement).href;
          data.socialLinks![platform as keyof typeof data.socialLinks] = href;
        }
      }

      // Check for live chat widgets (common indicators)
      const liveChatIndicators = [
        "tawk.to",
        "intercom",
        "drift",
        "zendesk",
        "livechat",
        "crisp",
        "tidio",
        "olark",
      ];

      data.hasLiveChat = liveChatIndicators.some((indicator) =>
        document.body.innerHTML.toLowerCase().includes(indicator)
      );

      // Detect technologies from script sources and meta tags
      data.technologies = [];

      // Check for common tech stacks
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const techPatterns: Record<string, string[]> = {
        WordPress: ["wp-content", "wp-includes"],
        Shopify: ["cdn.shopify.com", "shopify"],
        Wix: ["wix.com", "parastorage.com"],
        Squarespace: ["squarespace"],
        React: ["react", "react-dom"],
        "Google Analytics": ["google-analytics.com", "googletagmanager.com"],
        Facebook: ["connect.facebook.net"],
        "Google Tag Manager": ["googletagmanager.com"],
      };

      for (const [tech, patterns] of Object.entries(techPatterns)) {
        const found = scripts.some((script) => {
          const src = (script as HTMLScriptElement).src;
          return patterns.some((pattern) => src.includes(pattern));
        });

        if (found) {
          data.technologies!.push(tech);
        }
      }

      // Check for CMS meta tags
      const generator = document.querySelector('meta[name="generator"]');
      if (generator) {
        const content = generator.getAttribute("content");
        if (content) {
          data.technologies!.push(content);
        }
      }

      return data;
    });

    await browser.close();

    return businessData;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);

    if (browser) {
      await browser.close();
    }

    return null;
  }
}

/**
 * Convert scraped business data to Lead format
 */
export function scrapedDataToLead(
  data: ScrapedBusinessData,
  url: string,
  industry: string,
  location: string
): Lead {
  const leadId = `scraped-${Buffer.from(url).toString("base64").substring(0, 16)}`;

  // Count social presence
  const socialCount = data.socialLinks
    ? Object.values(data.socialLinks).filter(Boolean).length
    : 0;

  const socialPresence =
    socialCount > 0
      ? Object.keys(data.socialLinks || {})
          .filter((key) => data.socialLinks![key as keyof typeof data.socialLinks])
          .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
          .join(", ")
      : null;

  // Calculate opportunity score based on scraped data
  let opportunityScore = 50; // Base score

  if (data.phone) opportunityScore += 10;
  if (data.email) opportunityScore += 15;
  if (data.address) opportunityScore += 5;
  if (socialCount > 0) opportunityScore += socialCount * 5;
  if (data.hasLiveChat) opportunityScore += 10;
  if (data.technologies && data.technologies.length > 0) opportunityScore += 5;

  // Infer pain points
  const painPoints: string[] = [];
  if (!data.hasLiveChat) painPoints.push("No live chat support");
  if (!data.email) painPoints.push("No email contact visible");
  if (!data.phone) painPoints.push("No phone number visible");
  if (socialCount === 0) painPoints.push("No social media presence");
  if (!data.technologies?.includes("Google Analytics")) {
    painPoints.push("Missing analytics tracking");
  }

  return {
    id: leadId,
    business_name: data.name,
    industry: industry,
    location: location,
    phone: data.phone || null,
    email: data.email || null,
    website: url,
    rating: 0,
    review_count: 0,
    website_score: Math.min(opportunityScore, 100),
    social_presence: socialPresence,
    ad_presence: false,
    opportunity_score: Math.min(opportunityScore, 100),
    pain_points: painPoints,
    recommended_services: [],
    ai_summary: data.description || null,
    lat: null,
    lng: null,
    added_by: null,
    created_at: new Date().toISOString(),
    source: "web-scrape",
  };
}

/**
 * Batch scrape multiple URLs
 */
export async function batchScrapeWebsites(
  urls: string[],
  industry: string,
  location: string
): Promise<Lead[]> {
  const leads: Lead[] = [];

  // Process sequentially to avoid overwhelming the system
  for (const url of urls) {
    try {
      const data = await scrapeBusinessWebsite(url);
      if (data) {
        const lead = scrapedDataToLead(data, url, industry, location);
        leads.push(lead);
      }

      // Small delay between scrapes
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
    }
  }

  return leads;
}

/**
 * Enrich existing lead by scraping its website
 */
export async function enrichLeadWithWebscraping(lead: Lead): Promise<Lead> {
  if (!lead.website) {
    return lead;
  }

  try {
    const scrapedData = await scrapeBusinessWebsite(lead.website);

    if (!scrapedData) {
      return lead;
    }

    // Merge scraped data with existing lead
    return {
      ...lead,
      phone: lead.phone || scrapedData.phone || null,
      email: lead.email || scrapedData.email || null,
      social_presence:
        lead.social_presence ||
        (scrapedData.socialLinks
          ? Object.keys(scrapedData.socialLinks)
              .filter((key) => scrapedData.socialLinks![key as keyof typeof scrapedData.socialLinks])
              .join(", ")
          : null),
      pain_points: [
        ...lead.pain_points,
        ...(scrapedData.hasLiveChat ? [] : ["No live chat support"]),
      ],
      ai_summary: lead.ai_summary || scrapedData.description || null,
      enriched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Web scraping enrichment error:", error);
    return lead;
  }
}
