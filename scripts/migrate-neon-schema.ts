/**
 * Neon Database Schema Migration Script
 * Sets up production database with proper schema, indexes, and default data
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: '.env.development.local' });

const DATABASE_URL = process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('POSTGRES_URL or POSTGRES_DATABASE_URL not found in environment variables');
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🚀 Starting Neon database migration...\n');

  try {
    // 1. Create tables with proper schema
    console.log('📋 Creating tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        team_name TEXT NOT NULL,
        subscription_tier TEXT DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ teams table created');

    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'rep')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, email)
      )
    `;
    console.log('  ✓ team_members table created');

    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        business_name TEXT NOT NULL,
        industry TEXT,
        location TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        rating REAL,
        review_count INTEGER DEFAULT 0,
        website_score INTEGER DEFAULT 0,
        social_presence TEXT,
        ad_presence BOOLEAN DEFAULT false,
        opportunity_score INTEGER DEFAULT 0,
        pain_points TEXT,
        recommended_services TEXT,
        ai_summary TEXT,
        lat REAL,
        lng REAL,
        added_by TEXT,
        source TEXT DEFAULT 'manual',
        enriched_at TIMESTAMP,
        scored_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ leads table created');

    await sql`
      CREATE TABLE IF NOT EXISTS call_logs (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        member_id TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
        call_type TEXT NOT NULL,
        status TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        recording_url TEXT,
        sentiment_score REAL,
        next_action TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ call_logs table created');

    // 2. Create indexes for performance
    console.log('\n📊 Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_opportunity_score ON leads(opportunity_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_call_logs_member_id ON call_logs(member_id)`;
    console.log('  ✓ All indexes created');

    // 3. Check if default team exists
    console.log('\n👥 Setting up default team...');

    const existingTeams = await sql`SELECT id FROM teams LIMIT 1`;

    if (existingTeams.length === 0) {
      const teamId = `team-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await sql`
        INSERT INTO teams (id, team_name, subscription_tier)
        VALUES (${teamId}, 'Sales Team', 'pro')
      `;
      console.log(`  ✓ Created default team: ${teamId}`);

      // Create default team members
      const ownerId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const managerId = `member-${Date.now() + 1}-${Math.random().toString(36).substring(2, 9)}`;
      const repId = `member-${Date.now() + 2}-${Math.random().toString(36).substring(2, 9)}`;

      await sql`
        INSERT INTO team_members (id, team_id, name, email, role)
        VALUES
          (${ownerId}, ${teamId}, 'John Smith', 'john@salesteam.com', 'owner'),
          (${managerId}, ${teamId}, 'Sarah Johnson', 'sarah@salesteam.com', 'manager'),
          (${repId}, ${teamId}, 'Mike Davis', 'mike@salesteam.com', 'rep')
      `;
      console.log('  ✓ Created 3 default team members');
    } else {
      console.log('  ✓ Team already exists, skipping creation');
    }

    // 4. Verify schema
    console.log('\n✅ Verifying schema...');

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('  Tables in database:');
    tables.forEach((t: any) => console.log(`    - ${t.table_name}`));

    const leadCount = await sql`SELECT COUNT(*) as count FROM leads`;
    const teamCount = await sql`SELECT COUNT(*) as count FROM teams`;
    const memberCount = await sql`SELECT COUNT(*) as count FROM team_members`;

    console.log('\n📈 Current data:');
    console.log(`  - Teams: ${teamCount[0].count}`);
    console.log(`  - Members: ${memberCount[0].count}`);
    console.log(`  - Leads: ${leadCount[0].count}`);

    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate().catch(console.error);
