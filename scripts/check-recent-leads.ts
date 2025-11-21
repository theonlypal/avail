/**
 * Check recent leads
 */

import { neon } from '@neondatabase/serverless';

async function checkRecentLeads() {
  const sql = neon(process.env.POSTGRES_URL!);

  console.log('🔍 Checking recent leads...\n');

  try {
    // Get most recent leads
    const recentLeads = await sql`
      SELECT business_name, location, website, opportunity_score, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (recentLeads.length > 0) {
      console.log('Recent leads:');
      recentLeads.forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.business_name}`);
        console.log(`   Location: ${lead.location}`);
        console.log(`   Score: ${lead.opportunity_score}`);
        console.log(`   Website: ${lead.website || 'None'}`);
        console.log(`   Created: ${lead.created_at}`);
        console.log('');
      });
    } else {
      console.log('No leads found!');
    }

    // Check for LA leads
    const laLeads = await sql`SELECT COUNT(*) as count FROM leads WHERE location ILIKE '%Los Angeles%' OR location ILIKE '%LA%'`;
    console.log(`LA leads: ${laLeads[0].count}`);

    // Check for Eugene leads
    const eugeneLeads = await sql`SELECT COUNT(*) as count FROM leads WHERE location ILIKE '%Eugene%' OR location ILIKE '%Oregon%'`;
    console.log(`Eugene/Oregon leads: ${eugeneLeads[0].count}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecentLeads();
