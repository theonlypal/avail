/**
 * Lead Enrichment Script
 *
 * Enriches all leads with:
 * - Business websites (via Serper API web search)
 * - Email addresses (scraped from websites)
 * - Additional phone numbers
 * - Enhanced AI scoring based on digital presence
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import puppeteer from 'puppeteer';
import { getDb, getDefaultTeamId } from '../src/lib/db';

interface Lead {
  id: string;
  business_name: string;
  industry: string;
  location: string;
  phone: string;
  website: string | null;
  email: string | null;
  opportunity_score: number;
}

interface EnrichmentResult {
  website?: string;
  emails: string[];
  phones: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  hasContactForm: boolean;
  websiteQuality: number;
}

/**
 * Use Serper API to find business website via Google search
 */
async function findBusinessWebsite(businessName: string, location: string, industry: string): Promise<string | null> {
  try {
    console.log(`🔍 Searching for website: ${businessName}`);

    const query = `${businessName} ${location} ${industry} official website`;
    const serperApiKey = process.env.SERPER_API_KEY;

    if (!serperApiKey) {
      console.log(`   ⚠️  No SERPER_API_KEY found, skipping search`);
      return null;
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 5
      })
    });

    if (!response.ok) {
      console.log(`   ❌ Search API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.organic || [];

    if (results.length === 0) {
      console.log(`   ❌ No search results found`);
      return null;
    }

    const firstResult = results[0];
    const url = firstResult.link;

    if (!url || !url.startsWith('http')) {
      console.log(`   ❌ Invalid URL in results`);
      return null;
    }

    // Filter out irrelevant domains
    const irrelevantDomains = ['yelp.com', 'yellowpages.com', 'facebook.com', 'linkedin.com', 'instagram.com'];
    if (irrelevantDomains.some(domain => url.includes(domain))) {
      if (results.length > 1) {
        const secondUrl = results[1].link;
        if (secondUrl && !irrelevantDomains.some(d => secondUrl.includes(d))) {
          console.log(`   ✅ Found: ${secondUrl}`);
          return secondUrl;
        }
      }
      console.log(`   ⚠️  Only found directory listings`);
      return null;
    }

    console.log(`   ✅ Found: ${url}`);
    return url;
  } catch (error) {
    console.error(`   ❌ Error searching for website:`, error);
    return null;
  }
}

/**
 * Scrape website for contact information
 */
async function scrapeWebsiteForContacts(url: string): Promise<Partial<EnrichmentResult>> {
  let browser;

  try {
    console.log(`🌐 Scraping: ${url}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
    } catch (navError) {
      console.log(`   ⚠️  Navigation timeout, continuing with partial load`);
    }

    const pageContent = await page.evaluate(() => document.body.innerText);
    const pageHtml = await page.content();

    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = [...new Set(pageContent.match(emailRegex) || [])];

    const filteredEmails = emails.filter(email => {
      const lower = email.toLowerCase();
      return !lower.includes('example.com') &&
             !lower.includes('sentry.io') &&
             !lower.includes('wixpress.com') &&
             !lower.includes('privacy@') &&
             !lower.includes('noreply@');
    });

    // Extract phone numbers
    const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = [...new Set(pageContent.match(phoneRegex) || [])];

    // Check for contact form
    const hasContactForm = pageHtml.toLowerCase().includes('contact') &&
                          (pageHtml.includes('<form') || pageHtml.includes('contact-form'));

    // Extract social media
    const socialMedia: EnrichmentResult['socialMedia'] = {};
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href') || '')
    );

    for (const link of links) {
      if (link.includes('facebook.com/')) socialMedia.facebook = link;
      if (link.includes('instagram.com/')) socialMedia.instagram = link;
      if (link.includes('linkedin.com/')) socialMedia.linkedin = link;
      if (link.includes('twitter.com/') || link.includes('x.com/')) socialMedia.twitter = link;
    }

    // Website quality
    let websiteQuality = 50;
    if (filteredEmails.length > 0) websiteQuality += 20;
    if (phones.length > 0) websiteQuality += 10;
    if (hasContactForm) websiteQuality += 10;
    if (Object.keys(socialMedia).length > 0) websiteQuality += 10;

    console.log(`   📧 Emails: ${filteredEmails.length}`);
    console.log(`   📞 Phones: ${phones.length}`);
    console.log(`   📝 Contact form: ${hasContactForm ? 'Yes' : 'No'}`);
    console.log(`   ⭐ Website quality: ${websiteQuality}/100`);

    return {
      emails: filteredEmails,
      phones,
      socialMedia,
      hasContactForm,
      websiteQuality
    };

  } catch (error) {
    console.error(`   ❌ Error scraping:`, error);
    return {
      emails: [],
      phones: [],
      socialMedia: {},
      hasContactForm: false,
      websiteQuality: 0
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Calculate landability score - businesses easier to close get higher scores
 *
 * HIGH SCORE = Easy to land (poor digital presence, need help)
 * LOW SCORE = Hard to land (good digital presence, less urgent need)
 */
function calculateEnhancedScore(
  lead: Lead,
  enrichment: EnrichmentResult
): number {
  let score = lead.opportunity_score || 50;

  // NO WEBSITE = Much easier to land (+20 points)
  if (!enrichment.website) {
    score += 20;
  } else {
    // HAS WEBSITE - Check quality
    if (enrichment.websiteQuality < 50) {
      // POOR website = easier to land (+15 points)
      score += 15;
    } else if (enrichment.websiteQuality < 70) {
      // AVERAGE website = somewhat easier to land (+10 points)
      score += 10;
    } else if (enrichment.websiteQuality >= 80) {
      // GOOD website = harder to land (-10 points)
      score -= 10;
    }
  }

  // NO EMAIL = Easier to land, needs better systems (+15 points)
  if (enrichment.emails.length === 0) {
    score += 15;
  }

  // NO CONTACT FORM = Easier to land, missing key conversion tool (+10 points)
  if (!enrichment.hasContactForm) {
    score += 10;
  }

  // LIMITED SOCIAL MEDIA = Easier to land
  const socialCount = Object.keys(enrichment.socialMedia).length;
  if (socialCount === 0) {
    // No social = easier to land (+15 points)
    score += 15;
  } else if (socialCount <= 2) {
    // 1-2 social = somewhat easier to land (+5 points)
    score += 5;
  } else {
    // 3+ social = harder to land, good presence (-5 points)
    score -= 5;
  }

  return Math.min(Math.max(score, 0), 95);
}

/**
 * Enrich a single lead
 */
async function enrichLead(lead: Lead): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 Lead: ${lead.business_name}`);
  console.log(`   Industry: ${lead.industry} | Location: ${lead.location}`);
  console.log(`   Current Score: ${lead.opportunity_score}`);

  const enrichment: EnrichmentResult = {
    emails: [],
    phones: [],
    socialMedia: {},
    hasContactForm: false,
    websiteQuality: 0
  };

  // Find website if not exists
  if (!lead.website) {
    const website = await findBusinessWebsite(
      lead.business_name,
      lead.location,
      lead.industry
    );

    if (website) {
      enrichment.website = website;
    }
  } else {
    enrichment.website = lead.website;
    console.log(`✅ Website already exists: ${lead.website}`);
  }

  // Scrape website for contact info
  if (enrichment.website) {
    const scrapedData = await scrapeWebsiteForContacts(enrichment.website);
    Object.assign(enrichment, scrapedData);
  }

  // Calculate enhanced score
  const newScore = calculateEnhancedScore(lead, enrichment);

  // Update database
  const db = getDb();

  try {
    db.prepare(`
      UPDATE leads SET
        website = COALESCE(?, website),
        email = COALESCE(?, email),
        website_score = ?,
        opportunity_score = ?,
        enriched_at = ?
      WHERE id = ?
    `).run(
      enrichment.website || null,
      enrichment.emails[0] || null,
      enrichment.websiteQuality,
      newScore,
      new Date().toISOString(),
      lead.id
    );

    console.log(`\n💾 Updated in database:`);
    console.log(`   Website: ${enrichment.website || 'Not found'}`);
    console.log(`   Email: ${enrichment.emails[0] || 'Not found'}`);
    console.log(`   New Score: ${lead.opportunity_score} → ${newScore}`);

  } catch (error) {
    console.error(`❌ Database update failed:`, error);
  }
}

/**
 * Main enrichment process
 */
async function main() {
  console.log('🚀 LEAD ENRICHMENT STARTING');
  console.log('=' .repeat(80));
  console.log('This will:');
  console.log('1. Find business websites using Serper API (Google search)');
  console.log('2. Scrape websites for emails and phone numbers');
  console.log('3. Update AI scoring based on digital presence');
  console.log('4. Save all enriched data to database');
  console.log('=' .repeat(80));

  const db = getDb();
  const teamId = getDefaultTeamId();

  // Add enriched_at column if it doesn't exist
  try {
    db.exec(`
      ALTER TABLE leads ADD COLUMN enriched_at TEXT;
    `);
    console.log('✅ Added enriched_at column');
  } catch (error) {
    // Column probably already exists
  }

  // Fetch all leads that need enrichment
  const leads = db.prepare(`
    SELECT id, business_name, industry, location, phone, website, email, opportunity_score
    FROM leads
    WHERE team_id = ?
    ORDER BY opportunity_score DESC
  `).all(teamId) as Lead[];

  console.log(`\n📊 Found ${leads.length} leads to enrich`);
  console.log(`Starting enrichment process...\n`);

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];

    console.log(`\n[${i + 1}/${leads.length}]`);

    try {
      await enrichLead(lead);
      enriched++;

      // Rate limiting - wait 2 seconds between requests
      if (i < leads.length - 1) {
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to enrich ${lead.business_name}:`, error);
      failed++;
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('🎉 ENRICHMENT COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Successfully enriched: ${enriched} leads`);
  console.log(`❌ Failed: ${failed} leads`);

  // Show enrichment statistics
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(website) as with_website,
      COUNT(email) as with_email,
      ROUND(AVG(website_score)) as avg_website_score,
      ROUND(AVG(opportunity_score)) as avg_opportunity_score
    FROM leads
    WHERE team_id = ?
  `).get(teamId) as any;

  console.log('\n📈 Enrichment Statistics:');
  console.log(`   Total Leads: ${stats.total}`);
  console.log(`   With Website: ${stats.with_website} (${Math.round(stats.with_website / stats.total * 100)}%)`);
  console.log(`   With Email: ${stats.with_email} (${Math.round(stats.with_email / stats.total * 100)}%)`);
  console.log(`   Avg Website Quality: ${stats.avg_website_score}/100`);
  console.log(`   Avg Opportunity Score: ${stats.avg_opportunity_score}/100`);

  console.log('\n✨ Done!');
}

// Run the enrichment
main().catch(console.error);
