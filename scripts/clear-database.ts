/**
 * Clear all existing leads from production database
 * Fresh start for Google Places API integration
 */

import { sql } from '@vercel/postgres';

async function clearDatabase() {
  console.log('🗑️  Clearing all leads from production database...\n');

  try {
    // Get count before deletion
    const beforeCount = await sql`SELECT COUNT(*) as count FROM leads`;
    console.log(`📊 Current leads in database: ${beforeCount.rows[0].count}`);

    // Delete all leads
    const result = await sql`DELETE FROM leads`;
    console.log(`✅ Deleted ${result.rowCount} leads`);

    // Verify deletion
    const afterCount = await sql`SELECT COUNT(*) as count FROM leads`;
    console.log(`📊 Leads remaining: ${afterCount.rows[0].count}`);

    console.log('\n✨ Database cleared successfully! Ready for Google Places data.');

  } catch (error) {
    console.error('❌ Database clear error:', error);
    process.exit(1);
  }
}

clearDatabase();
