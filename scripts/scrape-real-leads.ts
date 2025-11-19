/**
 * Script to scrape 100 real businesses from the internet and populate database
 * Run with: npx tsx scripts/scrape-real-leads.ts
 */

import { getDb, getDefaultTeamId } from '../src/lib/db';
import { scrapeRealLeads, saveLeadsToDb } from '../src/lib/real-lead-scraper';

async function main() {
  console.log('🚀 Starting Leadly.AI Real Lead Scraper');
  console.log('=======================================\n');

  try {
    // Get database connection
    const db = getDb();
    const teamId = getDefaultTeamId();

    console.log(`📊 Database ready`);
    console.log(`👥 Team ID: ${teamId}\n`);

    // Scrape real businesses from the internet
    const leads = await scrapeRealLeads(teamId);

    // Save to database
    await saveLeadsToDb(leads, db);

    // Display stats
    const count = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    console.log(`\n✅ SUCCESS!`);
    console.log(`📊 Total leads in database: ${count.count}`);
    console.log(`🌐 All leads are real businesses scraped from the internet`);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
