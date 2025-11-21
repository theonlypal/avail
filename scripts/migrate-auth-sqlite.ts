/**
 * Migration script for authentication system - SQLite version
 * Creates users, sessions, and accounts tables for NextAuth.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'leadly.db');
const db = new Database(dbPath);

async function migrateAuth() {
  console.log('🚀 Starting authentication migration for SQLite...\n');

  try {
    // Create users table
    console.log('📋 Creating users table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        email_verified TEXT,
        password_hash TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ users table created');

    // Create accounts table (for OAuth providers)
    console.log('\n📋 Creating accounts table...');
    db.exec(`
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(provider, provider_account_id)
      )
    `);
    console.log('  ✓ accounts table created');

    // Create sessions table
    console.log('\n📋 Creating sessions table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        expires TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ sessions table created');

    // Create verification_tokens table
    console.log('\n📋 Creating verification_tokens table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires TEXT NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    console.log('  ✓ verification_tokens table created');

    // Create indexes for performance
    console.log('\n📊 Creating indexes...');

    db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token)`);

    console.log('  ✓ All indexes created');

    // Add user_id to existing tables for multi-tenancy (if they exist)
    console.log('\n📋 Adding user_id to existing tables...');

    // Check if tables exist first
    const allTables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    const tableNames = allTables.map((t: any) => t.name);

    // Handle teams table
    if (tableNames.includes('teams')) {
      const teamsInfo = db.pragma('table_info(teams)') as any[];
      const hasTeamsUserId = teamsInfo.some((col: any) => col.name === 'user_id');

      if (!hasTeamsUserId) {
        db.exec(`ALTER TABLE teams ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE`);
        console.log('  ✓ Added user_id to teams');
      } else {
        console.log('  ✓ user_id already exists in teams');
      }
      db.exec(`CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id)`);
    } else {
      console.log('  ⊘ teams table does not exist, skipping');
    }

    // Handle leads table
    if (tableNames.includes('leads')) {
      const leadsInfo = db.pragma('table_info(leads)') as any[];
      const hasLeadsUserId = leadsInfo.some((col: any) => col.name === 'user_id');

      if (!hasLeadsUserId) {
        db.exec(`ALTER TABLE leads ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE`);
        console.log('  ✓ Added user_id to leads');
      } else {
        console.log('  ✓ user_id already exists in leads');
      }
      db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)`);
    } else {
      console.log('  ⊘ leads table does not exist, skipping');
    }

    // Handle projects table
    if (tableNames.includes('projects')) {
      const projectsInfo = db.pragma('table_info(projects)') as any[];
      const hasProjectsUserId = projectsInfo.some((col: any) => col.name === 'user_id');

      if (!hasProjectsUserId) {
        db.exec(`ALTER TABLE projects ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE`);
        console.log('  ✓ Added user_id to projects');
      } else {
        console.log('  ✓ user_id already exists in projects');
      }
      db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);
    } else {
      console.log('  ⊘ projects table does not exist, skipping');
    }

    console.log('  ✓ Migration for existing tables completed');

    // Verify the schema
    console.log('\n✅ Verifying schema...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name IN ('users', 'accounts', 'sessions', 'verification_tokens')
      ORDER BY name
    `).all();

    if (tables.length > 0) {
      console.log('  New tables created:');
      tables.forEach((table: any) => {
        console.log(`    - ${table.name}`);
      });
    }

    // Check current data
    console.log('\n📈 Current data:');
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as any;
    console.log(`  - Users: ${userCount.count}`);
    console.log(`  - Sessions: ${sessionCount.count}`);

    console.log('\n✨ Authentication migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
migrateAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
