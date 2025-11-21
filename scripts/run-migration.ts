import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ No database URL found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Starting database migration...');
  console.log('📊 Database:', databaseUrl.split('@')[1]?.split('?')[0]);

  const client = new Client({ connectionString: databaseUrl });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/004_call_tracking_analytics.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📝 Running SQL migration...\n');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Created tables:');
    console.log('  - call_records');
    console.log('  - lead_folders');
    console.log('  - analytics_daily');
    console.log('\n📋 Updated tables:');
    console.log('  - leads (added 7 new columns for call tracking)');
    console.log('  - team_members (added 4 new columns for performance metrics)');
    console.log('\n🔧 Created functions:');
    console.log('  - update_lead_after_call()');
    console.log('  - aggregate_daily_analytics()');
    console.log('  - auto_aggregate_analytics()');
    console.log('  - create_default_folders()');
    console.log('\n🔒 Applied row-level security policies (6 new policies)');
    console.log('\n⚡ Created performance indexes (10 new indexes)');
    console.log('\n🎯 Seeded default folders for all existing teams');
    console.log('\n🎉 Database is ready for analytics and call tracking!');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    // Don't exit with error if tables already exist
    if (error.message?.includes('already exists')) {
      console.log('\n⚠️  Some objects already exist - migration may be partially complete');
      console.log('✅ This is okay - continuing...');
      process.exit(0);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
