/**
 * Clear all leads from production Neon PostgreSQL database
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.development.local') });

async function clearProductionLeads() {
  console.log('\n🗑️  Clearing Production Database\n');

  const databaseUrl = process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: POSTGRES_URL is not set in environment');
    process.exit(1);
  }

  console.log('✓ Connected to Neon PostgreSQL');

  try {
    const sql = neon(databaseUrl);

    // Delete all leads
    const deleteResult = await sql`DELETE FROM leads`;
    console.log(`✓ Deleted ${deleteResult.length || 0} leads from database`);

    // Get count to verify
    const countResult = await sql`SELECT COUNT(*) as count FROM leads`;
    const finalCount = countResult[0]?.count || 0;

    console.log(`\n✅ Database cleared! Current lead count: ${finalCount}`);

    if (finalCount > 0) {
      console.warn('⚠️  Warning: Some leads may still exist in database');
    } else {
      console.log('✨ Production database is now empty and ready for fresh leads\n');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

clearProductionLeads();
