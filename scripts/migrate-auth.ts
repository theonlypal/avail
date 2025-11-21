/**
 * Migration script for authentication system
 * Creates users, sessions, and accounts tables for NextAuth.js
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: '.env.development.local' });

const DATABASE_URL = process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('POSTGRES_URL or POSTGRES_DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

async function migrateAuth() {
  console.log('🚀 Starting authentication migration...\n');

  try {
    // Create users table
    console.log('📋 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        email_verified TIMESTAMP,
        password_hash TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ users table created');

    // Create accounts table (for OAuth providers)
    console.log('\n📋 Creating accounts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_account_id)
      )
    `;
    console.log('  ✓ accounts table created');

    // Create sessions table
    console.log('\n📋 Creating sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        session_token TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ sessions table created');

    // Create verification_tokens table
    console.log('\n📋 Creating verification_tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `;
    console.log('  ✓ verification_tokens table created');

    // Create indexes for performance
    console.log('\n📊 Creating indexes...');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id
      ON accounts(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id
      ON sessions(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_token
      ON sessions(session_token)
    `;

    console.log('  ✓ All indexes created');

    // Add user_id to existing tables for multi-tenancy
    console.log('\n📋 Adding user_id to existing tables...');

    try {
      await sql`
        ALTER TABLE teams
        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE
      `;
      console.log('  ✓ Added user_id to teams');
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        throw e;
      }
      console.log('  ✓ user_id already exists in teams');
    }

    try {
      await sql`
        ALTER TABLE leads
        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE
      `;
      console.log('  ✓ Added user_id to leads');
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        throw e;
      }
      console.log('  ✓ user_id already exists in leads');
    }

    try {
      await sql`
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE
      `;
      console.log('  ✓ Added user_id to projects');
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        throw e;
      }
      console.log('  ✓ user_id already exists in projects');
    }

    // Create indexes for user_id columns
    await sql`
      CREATE INDEX IF NOT EXISTS idx_teams_user_id
      ON teams(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_leads_user_id
      ON leads(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id
      ON projects(user_id)
    `;

    console.log('  ✓ Indexes created for user_id columns');

    // Verify the schema
    console.log('\n✅ Verifying schema...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
      ORDER BY table_name
    `;

    if (tables.length > 0) {
      console.log('  New tables created:');
      tables.forEach((table: any) => {
        console.log(`    - ${table.table_name}`);
      });
    }

    // Check current data
    console.log('\n📈 Current data:');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const sessionCount = await sql`SELECT COUNT(*) as count FROM sessions`;
    console.log(`  - Users: ${userCount[0].count}`);
    console.log(`  - Sessions: ${sessionCount[0].count}`);

    console.log('\n✨ Authentication migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
