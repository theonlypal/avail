/**
 * Production Migration Script for Neon (PostgreSQL)
 * Migrates all tables to production database
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: POSTGRES_URL or POSTGRES_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrateNeon() {
  console.log('🚀 Starting Neon (PostgreSQL) production migration...\\n');

  try {
    // Create users table
    console.log('📋 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
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

    // Create accounts table
    console.log('\\n📋 Creating accounts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(provider, provider_account_id)
      )
    `;
    console.log('  ✓ accounts table created');

    // Create sessions table
    console.log('\\n📋 Creating sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log('  ✓ sessions table created');

    // Create verification_tokens table
    console.log('\\n📋 Creating verification_tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `;
    console.log('  ✓ verification_tokens table created');

    // Create teams table
    console.log('\\n📋 Creating teams table...');
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        team_name TEXT NOT NULL,
        subscription_tier TEXT DEFAULT 'starter',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✓ teams table created');

    // Create team_members table
    console.log('\\n📋 Creating team_members table...');
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'rep',
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    console.log('  ✓ team_members table created');

    // Create companies table
    console.log('\\n📋 Creating companies table...');
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        country TEXT DEFAULT 'USA',
        employee_count INTEGER,
        annual_revenue INTEGER,
        description TEXT,
        logo_url TEXT,
        linkedin_url TEXT,
        twitter_url TEXT,
        facebook_url TEXT,
        tags TEXT,
        status TEXT DEFAULT 'prospect',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log('  ✓ companies table created');

    // Create leads table
    console.log('\\n📋 Creating leads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        team_id TEXT,
        user_id TEXT,
        company_id TEXT,
        business_name TEXT NOT NULL,
        industry TEXT,
        location TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        website_score INTEGER DEFAULT 0,
        social_presence TEXT,
        ad_presence BOOLEAN DEFAULT FALSE,
        opportunity_score INTEGER DEFAULT 0,
        pain_points JSONB DEFAULT '[]'::jsonb,
        recommended_services JSONB DEFAULT '[]'::jsonb,
        ai_summary TEXT,
        lat REAL,
        lng REAL,
        added_by TEXT,
        source TEXT,
        enriched_at TIMESTAMP,
        scored_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `;
    console.log('  ✓ leads table created');

    // Create contacts table
    console.log('\\n📋 Creating contacts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        user_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        title TEXT,
        department TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        linkedin_url TEXT,
        notes TEXT,
        last_contact_date TIMESTAMP,
        next_follow_up TIMESTAMP,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log('  ✓ contacts table created');

    // Create deals table
    console.log('\\n📋 Creating deals table...');
    await sql`
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT,
        lead_id TEXT,
        contact_id TEXT,
        title TEXT NOT NULL,
        value REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        stage TEXT DEFAULT 'discovery',
        probability INTEGER DEFAULT 10,
        expected_close_date TIMESTAMP,
        actual_close_date TIMESTAMP,
        description TEXT,
        notes TEXT,
        lost_reason TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      )
    `;
    console.log('  ✓ deals table created');

    // Create activities table
    console.log('\\n📋 Creating activities table...');
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lead_id TEXT,
        company_id TEXT,
        contact_id TEXT,
        deal_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        priority TEXT DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
      )
    `;
    console.log('  ✓ activities table created');

    // Create notes table
    console.log('\\n📋 Creating notes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lead_id TEXT,
        company_id TEXT,
        contact_id TEXT,
        deal_id TEXT,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
      )
    `;
    console.log('  ✓ notes table created');

    // Create call_logs table
    console.log('\\n📋 Creating call_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS call_logs (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        user_id TEXT,
        phone_number TEXT,
        direction TEXT,
        status TEXT,
        duration INTEGER,
        recording_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    console.log('  ✓ call_logs table created');

    // Create indexes
    console.log('\\n📊 Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id)`;

    console.log('  ✓ All indexes created');

    console.log('\\n✨ Neon production migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateNeon()
  .then(() => {
    console.log('\\n✅ Database is ready for production!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
