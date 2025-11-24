/**
 * Investigate production database to understand duplicate detection issue
 */

import { neon } from '@neondatabase/serverless';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable not set');
  process.exit(1);
}

const sql = neon(POSTGRES_URL);

async function investigateDatabase() {
  console.log('🔍 Investigating production database...\n');

  try {
    // Check total leads count
    const totalLeads = await sql`SELECT COUNT(*) as count FROM leads`;
    console.log(`📊 Total leads in database: ${totalLeads[0].count}\n`);

    // Get all column names first to understand schema
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'leads'
      ORDER BY ordinal_position
    `;
    console.log('📋 Leads table columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log();

    // Get sample leads with basic fields
    const sampleLeads = await sql`
      SELECT business_name, phone, location, industry, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 20
    `;
    console.log('📋 Recent 20 leads:');
    sampleLeads.forEach((lead: any, idx: number) => {
      console.log(`  ${idx + 1}. ${lead.business_name}`);
      console.log(`     Phone: ${lead.phone || 'N/A'}`);
      console.log(`     Location: ${lead.location}`);
      console.log(`     Industry: ${lead.industry}`);
      console.log(`     Created: ${lead.created_at}`);
      console.log();
    });

    // Check for leads matching "indian food in san diego"
    const indianFoodLeads = await sql`
      SELECT business_name, phone, location, industry
      FROM leads
      WHERE location ILIKE '%san diego%'
        AND (industry ILIKE '%indian%' OR industry ILIKE '%restaurant%' OR business_name ILIKE '%indian%')
    `;
    console.log(`\n🍛 Indian/restaurant leads in San Diego: ${indianFoodLeads.length}`);
    indianFoodLeads.forEach((lead: any) => {
      console.log(`  - ${lead.business_name} (${lead.phone || 'No phone'}) - ${lead.industry}`);
    });

  } catch (error) {
    console.error('❌ Database investigation error:', error);
    process.exit(1);
  }
}

investigateDatabase();
