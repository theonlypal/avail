#!/usr/bin/env tsx

/**
 * AI-Powered Lead Discovery Script
 *
 * Discovers real leads using Serper API + Anthropic Claude
 * Replaces fake/demo data with dynamically discovered businesses
 *
 * Usage:
 *   npx tsx scripts/discover-real-leads.ts
 *   npx tsx scripts/discover-real-leads.ts --industry="Plumbing" --location="Los Angeles, CA"
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { discoverLeads, discoverLeadsMultiLocation, rankLeads } from "../src/lib/ai-lead-discovery";
import { getDb } from "../src/lib/db";

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string): string => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1].replace(/"/g, "") : defaultValue;
};

const INDUSTRY = getArg("industry", "HVAC");
const LOCATION = getArg("location", "San Diego, CA");
const MAX_RESULTS = parseInt(getArg("max", "30"));

// Multi-location discovery
const MULTI_LOCATION_MODE = args.includes("--multi");
const LOCATIONS = [
  "San Diego, CA",
  "Los Angeles, CA",
  "San Francisco, CA",
  "Phoenix, AZ",
  "Las Vegas, NV",
];

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🤖 AI-POWERED LEAD DISCOVERY ENGINE");
  console.log("=".repeat(80));
  console.log(`Industry: ${INDUSTRY}`);
  console.log(`Location: ${MULTI_LOCATION_MODE ? LOCATIONS.join(", ") : LOCATION}`);
  console.log(`Max Results: ${MAX_RESULTS}`);
  console.log("=".repeat(80) + "\n");

  // Check API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ERROR: ANTHROPIC_API_KEY not found in environment");
    console.error("   Add it to .env.local file");
    process.exit(1);
  }

  if (!process.env.SERPER_API_KEY) {
    console.error("❌ ERROR: SERPER_API_KEY not found in environment");
    console.error("   Add it to .env.local file");
    process.exit(1);
  }

  console.log("✓ API keys found");
  console.log("✓ Starting lead discovery...\n");

  // Discover leads
  let result;
  if (MULTI_LOCATION_MODE) {
    console.log(`🌍 Multi-location discovery across ${LOCATIONS.length} cities\n`);
    result = await discoverLeadsMultiLocation(
      INDUSTRY,
      LOCATIONS,
      Math.floor(MAX_RESULTS / LOCATIONS.length)
    );
  } else {
    result = await discoverLeads({
      industry: INDUSTRY,
      location: LOCATION,
      maxResults: MAX_RESULTS,
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 DISCOVERY RESULTS");
  console.log("=".repeat(80));
  console.log(`Total search results: ${result.totalFound}`);
  console.log(`Qualified leads: ${result.leads.length}`);
  console.log(`Conversion rate: ${((result.leads.length / result.totalFound) * 100).toFixed(1)}%`);
  console.log("=".repeat(80) + "\n");

  if (result.leads.length === 0) {
    console.log("⚠️  No leads discovered. Try different search parameters.");
    process.exit(0);
  }

  // Rank leads
  const rankedLeads = rankLeads(result.leads);

  // Show top 5 leads
  console.log("🏆 TOP 5 DISCOVERED LEADS:\n");
  rankedLeads.slice(0, 5).forEach((lead, index) => {
    console.log(`${index + 1}. ${lead.name}`);
    console.log(`   📍 ${lead.city}, ${lead.state}`);
    console.log(`   📞 ${lead.phone || "No phone"}`);
    console.log(`   🌐 ${lead.website || "No website"}`);
    console.log(`   ⭐ Rating: ${lead.rating || "N/A"} (${lead.reviewCount || 0} reviews)`);
    console.log(`   💯 Opportunity Score: ${lead.opportunityScore}/100`);
    console.log(`   🎯 Confidence: ${lead.confidenceScore}/100`);
    console.log(`   🔥 Pain Points: ${lead.painPoints.slice(0, 2).join(", ")}`);
    console.log("");
  });

  // Save to database
  console.log("💾 Saving leads to database...\n");

  try {
    const db = getDb();
    let insertedCount = 0;

    // Get or create default team
    let team = db
      .prepare("SELECT id FROM teams LIMIT 1")
      .get() as { id: string } | undefined;

    if (!team) {
      const teamId = crypto.randomUUID();
      db.prepare(
        `INSERT INTO teams (id, name, industry, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(teamId, "Sales Team", INDUSTRY, Date.now(), Date.now());
      team = { id: teamId };
      console.log(`✓ Created team: ${teamId}`);
    }

    // Insert leads
    for (const lead of rankedLeads) {
      try {
        // Check if lead already exists
        let existing;
        if (lead.phone) {
          existing = db
            .prepare("SELECT id FROM leads WHERE phone = ?")
            .get(lead.phone);
        } else {
          existing = db
            .prepare("SELECT id FROM leads WHERE business_name = ? AND location LIKE ?")
            .get(lead.name, `%${lead.city}%`);
        }

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${lead.name}`);
          continue;
        }

        // Insert lead
        const leadId = crypto.randomUUID();
        const now = new Date().toISOString();
        const location = `${lead.city}, ${lead.state}`;

        db.prepare(
          `INSERT INTO leads (
            id, team_id, business_name, industry, location, phone, email, website,
            rating, review_count, opportunity_score, pain_points,
            source, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          leadId,
          team.id,
          lead.name,
          lead.industry,
          location,
          lead.phone,
          lead.email,
          lead.website,
          lead.rating || 0,
          lead.reviewCount || 0,
          lead.opportunityScore,
          JSON.stringify(lead.painPoints),
          lead.source,
          now,
          now
        );

        insertedCount++;
        console.log(`✓ Inserted: ${lead.name} (score: ${lead.opportunityScore})`);
      } catch (error) {
        console.error(`❌ Error inserting ${lead.name}:`, error);
        continue;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ LEAD DISCOVERY COMPLETE");
    console.log("=".repeat(80));
    console.log(`Discovered: ${result.leads.length} leads`);
    console.log(`Inserted: ${insertedCount} new leads`);
    console.log(`Duplicates skipped: ${result.leads.length - insertedCount}`);
    console.log("=".repeat(80) + "\n");

    // Show database stats
    const stats = db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
    console.log(`📊 Total leads in database: ${stats.count}\n`);

    console.log("🎉 Your database now has REAL leads that can be called!");
    console.log("   Visit the dashboard to see them.\n");
  } catch (error) {
    console.error("\n❌ Database error:", error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
