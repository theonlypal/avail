#!/usr/bin/env node

/**
 * Demo Account Provisioning Script - Session 5
 *
 * Usage: npx tsx bin/provision-demo.ts --url https://example.com
 *
 * This script:
 * 1. Scrapes company website for branding (logo, colors, services)
 * 2. Creates a demo business account in the database
 * 3. Sets 14-day auto-expiry
 * 4. Generates sample data (contacts, deals, appointments)
 * 5. Returns access credentials
 */

import puppeteer from 'puppeteer';
import { createBusiness, createContact, createDeal } from '../src/lib/db-crm';
import { v4 as uuidv4 } from 'uuid';

interface ProvisionOptions {
  url: string;
  teamId?: string;
  demoContacts?: number;
}

interface ScrapedData {
  businessName: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  services?: string[];
  phone?: string;
  address?: string;
}

async function scrapeWebsite(url: string): Promise<ScrapedData> {
  console.log(`🔍 Scraping website: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract business name from title or h1
    const businessName = await page.evaluate(() => {
      const titleElement = document.querySelector('title');
      const h1Element = document.querySelector('h1');
      return titleElement?.textContent?.trim() || h1Element?.textContent?.trim() || 'Demo Business';
    });

    // Try to find logo
    const logo = await page.evaluate(() => {
      const logoImg = document.querySelector('img[alt*="logo" i], img[class*="logo" i], .logo img');
      return logoImg?.getAttribute('src') || undefined;
    });

    // Extract primary colors from CSS
    const colors = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      const buttons = document.querySelectorAll('button, .btn, a[class*="button"]');

      let primary: string | undefined;
      if (buttons.length > 0) {
        const btnStyles = window.getComputedStyle(buttons[0] as Element);
        primary = btnStyles.backgroundColor;
      }

      return {
        primary: primary || undefined,
        secondary: styles.color || undefined,
      };
    });

    // Try to extract services from common patterns
    const services = await page.evaluate(() => {
      const serviceElements = document.querySelectorAll(
        '.service, .services li, [class*="service"] h3, [class*="service"] h2'
      );
      const extracted = Array.from(serviceElements)
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .slice(0, 10);

      return extracted.length > 0 ? extracted as string[] : undefined;
    });

    // Extract phone number
    const phone = await page.evaluate(() => {
      const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const text = document.body.textContent || '';
      const match = text.match(phoneRegex);
      return match ? match[0] : undefined;
    });

    // Extract address
    const address = await page.evaluate(() => {
      const addressElement = document.querySelector('[class*="address"], address');
      return addressElement?.textContent?.trim() || undefined;
    });

    console.log('✅ Website scraped successfully');
    console.log(`   Name: ${businessName}`);
    console.log(`   Logo: ${logo ? 'Found' : 'Not found'}`);
    console.log(`   Services: ${services?.length || 0} detected`);

    return {
      businessName,
      logo,
      colors,
      services,
      phone,
      address,
    };
  } catch (error: any) {
    console.error('❌ Failed to scrape website:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function provisionDemoAccount(options: ProvisionOptions): Promise<void> {
  const { url, teamId = 'demo-team-' + uuidv4(), demoContacts = 10 } = options;

  console.log('\n🚀 Starting demo account provisioning...\n');

  // Step 1: Scrape website
  const scrapedData = await scrapeWebsite(url);

  // Step 2: Create business in database
  console.log('\n📝 Creating business account...');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14); // 14-day expiry

  const business = await createBusiness({
    team_id: teamId,
    name: scrapedData.businessName,
    website: url,
    phone: scrapedData.phone,
    address: scrapedData.address,
    logo_url: scrapedData.logo,
    brand_colors: JSON.stringify(scrapedData.colors || {}),
    metadata: {
      scraped_at: new Date().toISOString(),
      services: scrapedData.services || [],
      demo_account: true,
      expires_at: expiresAt.toISOString(),
    },
  });

  console.log(`✅ Business created: ${business.id}`);
  console.log(`   Expires: ${expiresAt.toLocaleDateString()}`);

  // Step 3: Generate sample contacts
  console.log(`\n👥 Generating ${demoContacts} sample contacts...`);
  const sampleNames = [
    { first: 'John', last: 'Smith', email: 'john.smith@example.com', phone: '(555) 123-4567' },
    { first: 'Jane', last: 'Doe', email: 'jane.doe@example.com', phone: '(555) 987-6543' },
    { first: 'Bob', last: 'Johnson', email: 'bob.j@example.com', phone: '(555) 456-7890' },
    { first: 'Alice', last: 'Williams', email: 'alice.w@example.com', phone: '(555) 234-5678' },
    { first: 'Charlie', last: 'Brown', email: 'charlie.b@example.com', phone: '(555) 876-5432' },
    { first: 'Diana', last: 'Garcia', email: 'diana.g@example.com', phone: '(555) 345-6789' },
    { first: 'Evan', last: 'Martinez', email: 'evan.m@example.com', phone: '(555) 765-4321' },
    { first: 'Fiona', last: 'Rodriguez', email: 'fiona.r@example.com', phone: '(555) 234-8765' },
    { first: 'George', last: 'Lee', email: 'george.l@example.com', phone: '(555) 567-8901' },
    { first: 'Hannah', last: 'Taylor', email: 'hannah.t@example.com', phone: '(555) 890-1234' },
  ];

  const contacts = [];
  for (let i = 0; i < Math.min(demoContacts, sampleNames.length); i++) {
    const contact = await createContact({
      business_id: business.id,
      first_name: sampleNames[i].first,
      last_name: sampleNames[i].last,
      email: sampleNames[i].email,
      phone: sampleNames[i].phone,
      tags: ['demo-data'],
    });
    contacts.push(contact);
  }

  console.log(`✅ ${contacts.length} contacts created`);

  // Step 4: Generate sample deals
  console.log('\n💼 Generating sample deals...');
  const dealStages = ['new', 'contacted', 'qualified', 'proposal', 'won'];
  const dealCount = Math.min(5, contacts.length);

  for (let i = 0; i < dealCount; i++) {
    await createDeal({
      contact_id: contacts[i].id,
      stage: dealStages[Math.floor(Math.random() * dealStages.length)],
      value: Math.floor(Math.random() * 5000) + 500,
      source: 'website',
      notes: `Demo deal for ${contacts[i].first_name} ${contacts[i].last_name}`,
    });
  }

  console.log(`✅ ${dealCount} deals created`);

  // Step 5: Output credentials
  console.log('\n✅ Demo account provisioning complete!\n');
  console.log('═'.repeat(60));
  console.log('📋 DEMO ACCOUNT DETAILS');
  console.log('═'.repeat(60));
  console.log(`Business ID: ${business.id}`);
  console.log(`Team ID: ${teamId}`);
  console.log(`Business Name: ${business.name}`);
  console.log(`Website: ${business.website}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Deals: ${dealCount}`);
  console.log(`Expires: ${expiresAt.toLocaleDateString()} (14 days)`);
  console.log('═'.repeat(60));
  console.log('\n🔗 Access URL: http://localhost:3000?demo=' + business.id);
  console.log('\n💡 TIP: This account will auto-expire in 14 days');
  console.log('');
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');

  if (urlIndex === -1 || !args[urlIndex + 1]) {
    console.error('❌ Error: Missing required --url parameter');
    console.log('\nUsage: npx tsx bin/provision-demo.ts --url https://example.com');
    console.log('\nOptions:');
    console.log('  --url <url>       Company website URL to scrape (required)');
    console.log('  --team <id>       Custom team ID (optional)');
    console.log('  --contacts <n>    Number of demo contacts to create (default: 10)');
    console.log('\nExample:');
    console.log('  npx tsx bin/provision-demo.ts --url https://acmeplumbing.com --contacts 15');
    process.exit(1);
  }

  const url = args[urlIndex + 1];
  const teamIndex = args.indexOf('--team');
  const contactsIndex = args.indexOf('--contacts');

  const options: ProvisionOptions = {
    url,
    teamId: teamIndex !== -1 ? args[teamIndex + 1] : undefined,
    demoContacts: contactsIndex !== -1 ? parseInt(args[contactsIndex + 1]) : 10,
  };

  try {
    await provisionDemoAccount(options);
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Provisioning failed:', error.message);
    process.exit(1);
  }
}

// Only run if executed directly
if (require.main === module) {
  main();
}

export { provisionDemoAccount, scrapeWebsite };
