/**
 * Script to populate database with 100 realistic demo leads
 * Run with: npm run seed
 */

import { getDb } from '../src/lib/db';
import Database from 'better-sqlite3';

function seedDemoLeads(db: Database.Database, teamId: string) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO leads (
      id, team_id, business_name, industry, location,
      phone, email, website, rating, review_count,
      website_score, social_presence, ad_presence,
      opportunity_score, pain_points, estimated_revenue,
      employee_count, business_age, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const timestamp = Date.now();
  const leads: any[] = [];

  // Industry configurations
  const industries = [
    { name: "HVAC", city: "San Diego, CA", lat: 32.7157, lng: -117.1611, areaCode: "619", count: 15 },
    { name: "Plumbing", city: "Phoenix, AZ", lat: 33.4484, lng: -112.0740, areaCode: "602", count: 15 },
    { name: "Dental", city: "Austin, TX", lat: 30.2672, lng: -97.7431, areaCode: "512", count: 12 },
    { name: "Legal Services", city: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, areaCode: "213", count: 10 },
    { name: "Real Estate", city: "Miami, FL", lat: 25.7617, lng: -80.1918, areaCode: "305", count: 10 },
    { name: "Restaurant", city: "Chicago, IL", lat: 41.8781, lng: -87.6298, areaCode: "312", count: 10 },
    { name: "Auto Repair", city: "Dallas, TX", lat: 32.7767, lng: -96.7970, areaCode: "214", count: 10 },
    { name: "Beauty Salon", city: "Seattle, WA", lat: 47.6062, lng: -122.3321, areaCode: "206", count: 10 },
    { name: "Fitness Center", city: "Atlanta, GA", lat: 33.7490, lng: -84.3880, areaCode: "404", count: 8 },
  ];

  const prefixes = ["Elite", "Pro", "Premier", "Quality", "Reliable", "Superior", "Advanced", "Perfect", "Complete", "Expert"];
  const suffixes = {
    "HVAC": ["HVAC", "Heating & Air", "Air Conditioning"],
    "Plumbing": ["Plumbing", "Plumbing Services", "Plumbers"],
    "Dental": ["Dental", "Dentistry", "Dental Care"],
    "Legal Services": ["Law Firm", "Legal Services", "Attorneys"],
    "Real Estate": ["Realty", "Real Estate", "Properties"],
    "Restaurant": ["Bistro", "Grill", "Kitchen"],
    "Auto Repair": ["Auto Repair", "Auto Service", "Car Care"],
    "Beauty Salon": ["Salon", "Beauty Bar", "Hair Studio"],
    "Fitness Center": ["Fitness", "Gym", "Training Center"],
  };

  let leadCounter = 1;

  for (const industry of industries) {
    const industrySuffixes = suffixes[industry.name as keyof typeof suffixes] || ["Services"];
    
    for (let i = 0; i < industry.count; i++) {
      const prefix = prefixes[i % prefixes.length];
      const suffix = industrySuffixes[i % industrySuffixes.length];
      const businessName = prefix + " " + suffix;
      
      const rating = Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
      const reviewCount = Math.floor(Math.random() * 290) + 10;
      const hasWebsite = Math.random() > 0.35;
      const websiteScore = hasWebsite ? Math.floor(Math.random() * 40) + 50 : 0;
      
      let opportunityScore = 50;
      if (reviewCount > 200) opportunityScore += 15;
      else if (reviewCount > 100) opportunityScore += 10;
      else if (reviewCount > 50) opportunityScore += 5;
      
      if (rating < 4.0 && reviewCount > 20) opportunityScore += 20;
      else if (rating < 4.5 && reviewCount > 50) opportunityScore += 10;
      
      if (!hasWebsite) opportunityScore += 15;
      opportunityScore = Math.min(opportunityScore, 95);
      
      const painPoints: string[] = [];
      if (!hasWebsite) painPoints.push("No dedicated website");
      if (rating < 4.0 && reviewCount > 10) painPoints.push("Low online ratings need improvement");
      if (reviewCount < 50) painPoints.push("Limited online presence");
      
      const services: string[] = [];
      if (!hasWebsite) services.push("Website Development");
      if (rating < 4.5) services.push("Review Management");
      if (reviewCount < 100) services.push("Local SEO & Marketing");
      services.push("AI Chat Widget");
      
      const phone = "(" + industry.areaCode + ") 555-" + String(1000 + leadCounter).padStart(4, '0');
      const website = hasWebsite ? "https://" + businessName.toLowerCase().replace(/[^a-z0-9]+/g, '') + ".com" : null;
      
      // Generate realistic business attributes
      const employeeCount = Math.floor(Math.random() * 50) + 2;
      const businessAge = Math.floor(Math.random() * 25) + 1;
      const estimatedRevenue = employeeCount < 10 ? "$100K-$500K" :
                               employeeCount < 25 ? "$500K-$2M" : "$2M-$10M";

      stmt.run(
        "lead-" + timestamp + "-" + leadCounter,
        teamId,
        businessName,
        industry.name,
        industry.city,
        phone,
        null, // email
        website,
        rating,
        reviewCount,
        websiteScore,
        null, // social_presence
        Math.random() > 0.7 ? 1 : 0, // ad_presence
        opportunityScore,
        JSON.stringify(painPoints),
        estimatedRevenue,
        employeeCount,
        businessAge,
        new Date().toISOString()
      );
      
      leadCounter++;
    }
  }

  return leadCounter - 1;
}

async function main() {
  console.log('🚀 Seeding Leadly.AI with Demo Leads');
  console.log('====================================\n');

  try {
    const db = getDb();
    const teamId = db.prepare('SELECT id FROM teams LIMIT 1').get() as { id: string };
    
    if (!teamId) {
      throw new Error('No team found in database');
    }

    console.log('📊 Database ready');
    console.log('👥 Team ID: ' + teamId.id + '\n');
    console.log('🌱 Generating 100 demo leads...\n');

    const count = seedDemoLeads(db, teamId.id);

    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    
    console.log('\n✅ SUCCESS!');
    console.log('📊 Created ' + count + ' demo leads');
    console.log('📊 Total leads in database: ' + totalLeads.count);

    db.close();
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
