/**
 * Add website_tech column to leads table
 */

import { neon } from '@neondatabase/serverless';

async function addWebsiteTechColumn() {
  const sql = neon(process.env.POSTGRES_URL!);

  console.log('🔧 Adding website_tech column to leads table...\n');

  try {
    // Add website_tech column (JSON type for storing detection results)
    await sql`
      ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS website_tech JSONB DEFAULT NULL
    `;

    console.log('✅ Successfully added website_tech column!');
    console.log('   Column type: JSONB (stores platform, confidence, indicators)');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addWebsiteTechColumn();
