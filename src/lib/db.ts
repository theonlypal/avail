/**
 * Database Layer for AVAIL
 * - Development: SQLite (better-sqlite3)
 * - Production: PostgreSQL (pg driver) - Railway
 */

import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

// Only import better-sqlite3 in development to avoid native module issues in production
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try {
    Database = require('better-sqlite3');
  } catch {
    console.warn('better-sqlite3 not available - this is expected in production');
  }
}

// Postgres connection URL
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// PostgreSQL Pool for production (Railway)
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: false, // Railway internal connections don't need SSL
    max: 10,
    idleTimeoutMillis: 30000,
  });
  console.log('[DB] Using pg Pool for Railway Postgres');
}

// SQLite setup (local development)
const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
const DATA_DIR = path.join(process.cwd(), 'data');

if (!IS_PRODUCTION && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

function getSqliteDb(): any {
  if (!sqliteDb) {
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    initializeSqliteSchema();
  }
  return sqliteDb;
}

/**
 * Initialize SQLite schema (local development only)
 */
function initializeSqliteSchema() {
  const db = getSqliteDb();

  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      subscription_tier TEXT DEFAULT 'starter',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Team members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'rep',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);

  // Leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      business_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      location TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      website_score INTEGER DEFAULT 0,
      social_presence TEXT,
      ad_presence INTEGER DEFAULT 0,
      opportunity_score INTEGER DEFAULT 0,
      pain_points TEXT,
      estimated_revenue TEXT,
      employee_count INTEGER,
      business_age INTEGER,
      last_updated DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);

  // Call logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      call_sid TEXT,
      status TEXT DEFAULT 'initiated',
      direction TEXT DEFAULT 'outbound',
      duration INTEGER DEFAULT 0,
      recording_url TEXT,
      started_at DATETIME,
      ended_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE
    )
  `);

  // Create default team and member if they don't exist
  const teamExists = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
  if (teamExists.count === 0) {
    const teamId = 'default-team-' + Date.now();
    db.prepare(`
      INSERT INTO teams (id, team_name, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(teamId, 'Sales Team');

    const memberId = 'default-member-' + Date.now();
    db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(memberId, teamId, 'Admin User', 'admin@leadly.ai', 'owner');
  }

  console.log('✅ SQLite database initialized at:', DB_PATH);
}

/**
 * Initialize Postgres schema (production only)
 */
export async function initializePostgresSchema() {
  console.log('🔍 Checking database connection...');
  console.log('IS_PRODUCTION:', IS_PRODUCTION);
  console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('postgresUrl value:', postgresUrl ? 'SET' : 'NOT SET');
  console.log('pgPool:', pgPool ? 'INITIALIZED' : 'NULL');

  if (!pgPool) {
    throw new Error('Postgres connection not available - missing DATABASE_URL or POSTGRES_URL environment variable');
  }

  try {
    const client = await pgPool.connect();
    try {
      await client.query(`CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, team_name TEXT NOT NULL, subscription_tier TEXT DEFAULT 'starter', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await client.query(`CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role TEXT DEFAULT 'rep', avatar_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await client.query(`CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE, business_name TEXT NOT NULL, industry TEXT NOT NULL, location TEXT NOT NULL, phone TEXT, email TEXT, website TEXT, rating REAL DEFAULT 0, review_count INTEGER DEFAULT 0, website_score INTEGER DEFAULT 0, social_presence TEXT, ad_presence INTEGER DEFAULT 0, opportunity_score INTEGER DEFAULT 0, pain_points TEXT, estimated_revenue TEXT, employee_count INTEGER, business_age INTEGER, last_updated TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await client.query(`CREATE TABLE IF NOT EXISTS call_logs (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE, member_id TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE, call_sid TEXT, status TEXT DEFAULT 'initiated', direction TEXT DEFAULT 'outbound', duration INTEGER DEFAULT 0, recording_url TEXT, started_at TIMESTAMP, ended_at TIMESTAMP, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

      // Create default team if needed
      const result = await client.query('SELECT COUNT(*) as count FROM teams');
      if (parseInt(result.rows[0].count) === 0) {
        const teamId = 'default-team-' + Date.now();
        await client.query('INSERT INTO teams (id, team_name, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [teamId, 'Sales Team']);
        const memberId = 'default-member-' + Date.now();
        await client.query('INSERT INTO team_members (id, team_id, name, email, role) VALUES ($1, $2, $3, $4, $5)', [memberId, teamId, 'Admin User', 'admin@leadly.ai', 'owner']);
      }

      console.log('✅ Railway Postgres database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing Postgres schema:', error);
    throw error;
  }
}

/**
 * Export unified database interface
 *
 * For production (Railway Postgres), uses pg Pool.
 * For development (SQLite), uses better-sqlite3.
 */
export const db = {
  isProduction: IS_PRODUCTION,
  pool: pgPool, // Expose pool for direct access if needed

  async query(queryString: string, params: any[] = []): Promise<any[]> {
    if (IS_PRODUCTION) {
      if (!pgPool) throw new Error('Postgres connection not available');
      // pg uses $1, $2, etc. for parameters
      const result = await pgPool.query(queryString, params);
      return result.rows;
    } else {
      // SQLite query
      const sqliteDb = getSqliteDb();
      const stmt = sqliteDb.prepare(queryString);
      return stmt.all(...params);
    }
  },

  async run(queryString: string, params: any[] = []): Promise<void> {
    if (IS_PRODUCTION) {
      if (!pgPool) throw new Error('Postgres connection not available');
      await pgPool.query(queryString, params);
    } else {
      const sqliteDb = getSqliteDb();
      const stmt = sqliteDb.prepare(queryString);
      stmt.run(...params);
    }
  },

  async get(queryString: string, params: any[] = []): Promise<any | undefined> {
    if (IS_PRODUCTION) {
      if (!pgPool) throw new Error('Postgres connection not available');
      const result = await pgPool.query(queryString, params);
      return result.rows[0];
    } else {
      const sqliteDb = getSqliteDb();
      const stmt = sqliteDb.prepare(queryString);
      return stmt.get(...params);
    }
  }
};

// Export pgPool and IS_PRODUCTION for other modules to use
export { pgPool, IS_PRODUCTION };

// For backwards compatibility with existing code
export function getDb(): any {
  if (IS_PRODUCTION) {
    throw new Error('Cannot use getDb() in production - use db.query() instead');
  }
  return getSqliteDb();
}

export function getDefaultTeamId(): string {
  if (IS_PRODUCTION) {
    // In production, this should be called async via API
    throw new Error('Cannot use getDefaultTeamId() in production - query teams table directly');
  }

  // Query the first team from the database
  const sqliteDb = getSqliteDb();
  const team = sqliteDb.prepare('SELECT id FROM teams LIMIT 1').get() as { id: string } | undefined;

  if (!team) {
    throw new Error('No team found in database - run initialization first');
  }

  return team.id;
}
