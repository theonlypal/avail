/**
 * Check database status
 */

import { neon } from '@neondatabase/serverless';

async function checkDatabase() {
  const sql = neon(process.env.POSTGRES_URL!);

  console.log('🔍 Checking database...\n');

  try {
    // Check leads count
    const leadCount = await sql`SELECT COUNT(*) as count FROM leads`;
    console.log(`Total leads in database: ${leadCount[0].count}`);

    // Get sample leads
    const sampleLeads = await sql`SELECT business_name, location, website, opportunity_score FROM leads LIMIT 5`;

    if (sampleLeads.length > 0) {
      console.log('\nSample leads:');
      sampleLeads.forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.business_name} - ${lead.location}`);
        console.log(`   Score: ${lead.opportunity_score}, Website: ${lead.website || 'None'}`);
      });
    } else {
      console.log('\n❌ No leads found in database!');
    }

    // Check teams
    const teamCount = await sql`SELECT COUNT(*) as count FROM teams`;
    console.log(`\nTotal teams: ${teamCount[0].count}`);

  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkDatabase();
