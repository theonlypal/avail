/**
 * Clear all leads from production database
 * USE WITH CAUTION - This will delete ALL leads
 */

import { neon } from '@neondatabase/serverless';

async function clearAllLeads() {
  const sql = neon(process.env.POSTGRES_URL!);

  console.log('⚠️  WARNING: This will delete ALL leads from the database!\n');

  try {
    // Count current leads
    const countResult = await sql`SELECT COUNT(*) as count FROM leads`;
    const currentCount = countResult[0]?.count || 0;

    console.log(`📊 Current leads in database: ${currentCount}`);

    if (currentCount === 0) {
      console.log('\n✅ Database is already empty. No action needed.');
      return;
    }

    console.log('\n🗑️  Deleting all leads...');

    // Delete all leads
    await sql`DELETE FROM leads`;

    // Verify deletion
    const verifyResult = await sql`SELECT COUNT(*) as count FROM leads`;
    const remainingCount = verifyResult[0]?.count || 0;

    console.log(`\n✅ Successfully deleted ${currentCount} leads`);
    console.log(`📊 Remaining leads: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('\n🎉 Database is now clean and ready for testing!');
    } else {
      console.error('\n⚠️  Warning: Some leads may not have been deleted');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

clearAllLeads();
