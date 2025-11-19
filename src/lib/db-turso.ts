/**
 * Turso Database Layer for Production (Vercel)
 * Uses LibSQL for SQLite-compatible cloud database
 * Falls back to local SQLite in development
 */

import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Check if we're in production with Turso credentials
const isProduction = process.env.NODE_ENV === 'production';
const hasTursoCredentials = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

// Database adapter interface
interface DbAdapter {
  execute: (sql: string, params?: any[]) => { rows: any[] };
  prepare: (sql: string) => {
    all: (...params: any[]) => any[];
    get: (...params: any[]) => any;
    run: (...params: any[]) => any;
  };
}

let dbInstance: DbAdapter | null = null;

/**
 * Get database instance (Turso in production, SQLite locally)
 */
export function getDb(): DbAdapter {
  if (dbInstance) {
    return dbInstance;
  }

  // Use Turso in production if credentials are available
  if (isProduction && hasTursoCredentials) {
    console.log('🌐 Using Turso cloud database');
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    // Create adapter that mimics better-sqlite3 interface
    dbInstance = {
      execute: (sql: string, params?: any[]) => {
        return turso.execute({ sql, args: params || [] }) as any;
      },
      prepare: (sql: string) => {
        return {
          all: (...params: any[]) => {
            const result = turso.execute({ sql, args: params });
            return (result as any).rows || [];
          },
          get: (...params: any[]) => {
            const result = turso.execute({ sql, args: params });
            return ((result as any).rows || [])[0];
          },
          run: (...params: any[]) => {
            return turso.execute({ sql, args: params });
          },
        };
      },
    };
  } else {
    // Use local SQLite in development
    console.log('💾 Using local SQLite database');
    const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
    const DATA_DIR = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');

    // Wrap better-sqlite3 to match our interface
    dbInstance = {
      execute: (sql: string, params?: any[]) => {
        const stmt = sqlite.prepare(sql);
        const rows = stmt.all(...(params || []));
        return { rows };
      },
      prepare: (sql: string) => sqlite.prepare(sql) as any,
    };
  }

  // Initialize schema on first connection
  initializeSchema();

  return dbInstance;
}

/**
 * Initialize database schema
 */
function initializeSchema() {
  const db = getDb();

  // Teams table
  db.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      subscription_tier TEXT DEFAULT 'starter',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Team members table
  db.execute(`
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

  // Leads table with verification columns
  db.execute(`
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
      recommended_services TEXT,
      ai_summary TEXT,
      lat REAL,
      lng REAL,
      added_by TEXT,
      source TEXT DEFAULT 'manual',
      enriched_at DATETIME,
      scored_at DATETIME,
      verified INTEGER DEFAULT 0,
      verification_notes TEXT,
      verification_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);

  // Lead assignments table
  db.execute(`
    CREATE TABLE IF NOT EXISTS lead_assignments (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      lead_id TEXT NOT NULL UNIQUE,
      assigned_to TEXT,
      assigned_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    )
  `);

  // Outreach logs table
  db.execute(`
    CREATE TABLE IF NOT EXISTS outreach_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      sent_by TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      opened INTEGER DEFAULT 0,
      responded INTEGER DEFAULT 0,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    )
  `);

  // Activity logs table
  db.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);

  // Create default team if it doesn't exist
  const defaultTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get('team-default');
  if (!defaultTeam) {
    db.prepare(`
      INSERT INTO teams (id, team_name, subscription_tier)
      VALUES (?, ?, ?)
    `).run('team-default', 'Default Team', 'pro');
  }

  console.log('✅ Database schema initialized');
}

/**
 * Get the default team ID
 */
export function getDefaultTeamId(): string {
  return 'team-default';
}

/**
 * Close database connection (useful for cleanup)
 */
export function closeDb() {
  dbInstance = null;
}
