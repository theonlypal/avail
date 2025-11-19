/**
 * Test Lead Enrichment - Only enriches 3 leads for testing
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer';
import { getDb, getDefaultTeamId } from '../src/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

async function findBusinessWebsite(businessName: string, location: string, industry: string): Promise<string | null> {
  try {
    console.log(`🔍 Searching for website: ${businessName}`);

    // Use Serper API for Google search
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

    // Extract URLs from search results
    const results = data.organic || [];

    if (results.length === 0) {
      console.log(`   ❌ No search results found`);
      return null;
    }

    // Get the first result's URL
    const firstResult = results[0];
    const url = firstResult.link;

    // Basic validation
    if (!url || !url.startsWith('http')) {
      console.log(`   ❌ Invalid URL in results`);
      return null;
    }

    // Filter out irrelevant domains
    const irrelevantDomains = ['yelp.com', 'yellowpages.com', 'facebook.com', 'linkedin.com', 'instagram.com'];
    if (irrelevantDomains.some(domain => url.includes(domain))) {
      // Try second result if first is a directory site
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

async function enrichLead(lead: Lead): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 Lead: ${lead.business_name}`);
  console.log(`   Industry: ${lead.industry} | Location: ${lead.location}`);

  const enrichment: EnrichmentResult = {
    emails: [],
    phones: [],
    socialMedia: {},
    hasContactForm: false,
    websiteQuality: 0
  };

  // Find website
  if (!lead.website) {
    const website = await findBusinessWebsite(lead.business_name, lead.location, lead.industry);
    if (website) {
      enrichment.website = website;
    }
  } else {
    enrichment.website = lead.website;
  }

  // Scrape website
  if (enrichment.website) {
    const scrapedData = await scrapeWebsiteForContacts(enrichment.website);
    Object.assign(enrichment, scrapedData);
  }

  // Update database
  const db = getDb();

  try {
    db.prepare(`
      UPDATE leads SET
        website = COALESCE(?, website),
        email = COALESCE(?, email),
        website_score = ?
      WHERE id = ?
    `).run(
      enrichment.website || null,
      enrichment.emails[0] || null,
      enrichment.websiteQuality,
      lead.id
    );

    console.log(`\n💾 Updated:`);
    console.log(`   Website: ${enrichment.website || 'Not found'}`);
    console.log(`   Email: ${enrichment.emails[0] || 'Not found'}`);

  } catch (error) {
    console.error(`❌ Update failed:`, error);
  }
}

async function main() {
  console.log('🧪 TESTING ENRICHMENT ON 3 LEADS');
  console.log('='.repeat(80));

  const db = getDb();
  const teamId = getDefaultTeamId();

  // Get first 3 leads
  const leads = db.prepare(`
    SELECT id, business_name, industry, location, phone, website, email, opportunity_score
    FROM leads
    WHERE team_id = ?
    LIMIT 3
  `).all(teamId) as Lead[];

  console.log(`\n📊 Testing with ${leads.length} leads\n`);

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`\n[${i + 1}/${leads.length}]`);

    try {
      await enrichLead(lead);

      if (i < leads.length - 1) {
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed:`, error);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 TEST COMPLETE');
  console.log('='.repeat(80));
}

main().catch(console.error);
