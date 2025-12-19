/**
 * Prospects Database Layer
 *
 * Manages prospect data for demo personalization.
 * Prospects are potential customers who fill out the intake form
 * and receive personalized demo experiences.
 */

import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

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

// PostgreSQL Pool for production (Railway)
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
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
    initializeProspectSchema();
  }
  return sqliteDb;
}

/**
 * Prospect interface - represents a potential customer
 */
export interface Prospect {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  industry: string;
  business_type: string;
  location?: string;
  team_id?: string;

  // Intake form data
  services?: string[];
  pain_points?: string[];
  current_tools?: string[];
  monthly_leads?: number;
  avg_deal_value?: number;

  // Online presence
  website_url?: string;
  google_business_url?: string;
  social_handles?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Demo preferences
  demo_preferences?: {
    focus_areas: string[];
    brand_colors?: string;
    logo_url?: string;
  };

  // Demo access
  demo_token?: string;
  demo_expires_at?: string;

  // Status
  status: 'new' | 'contacted' | 'demo_scheduled' | 'demo_completed' | 'converted' | 'lost';
  source?: string;
  notes?: string;

  created_at: string;
  updated_at: string;
}

/**
 * Initialize prospects schema
 */
function initializeProspectSchema() {
  const db = getSqliteDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT,
      industry TEXT NOT NULL,
      business_type TEXT NOT NULL,
      location TEXT,
      team_id TEXT,

      services TEXT,
      pain_points TEXT,
      current_tools TEXT,
      monthly_leads INTEGER,
      avg_deal_value REAL,

      website_url TEXT,
      google_business_url TEXT,
      social_handles TEXT,

      demo_preferences TEXT,
      demo_token TEXT UNIQUE,
      demo_expires_at DATETIME,

      status TEXT NOT NULL DEFAULT 'new',
      source TEXT,
      notes TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for demo token lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_prospects_demo_token ON prospects(demo_token)
  `);

  // Create index for email lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(contact_email)
  `);
}

/**
 * Create a new prospect
 */
export async function createProspect(data: Omit<Prospect, 'id' | 'created_at' | 'updated_at' | 'demo_token'>): Promise<Prospect> {
  const id = uuidv4();
  const demo_token = uuidv4().replace(/-/g, '').substring(0, 16);
  const now = new Date().toISOString();

  // Demo link expires in 30 days
  const demo_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO prospects (
        id, company_name, contact_name, contact_email, contact_phone,
        industry, business_type, location, team_id,
        services, pain_points, current_tools, monthly_leads, avg_deal_value,
        website_url, google_business_url, social_handles,
        demo_preferences, demo_token, demo_expires_at,
        status, source, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
      [
        id, data.company_name, data.contact_name, data.contact_email, data.contact_phone || null,
        data.industry, data.business_type, data.location || null, data.team_id || null,
        JSON.stringify(data.services || []), JSON.stringify(data.pain_points || []),
        JSON.stringify(data.current_tools || []), data.monthly_leads || null, data.avg_deal_value || null,
        data.website_url || null, data.google_business_url || null,
        JSON.stringify(data.social_handles || {}),
        JSON.stringify(data.demo_preferences || {}), demo_token, demo_expires_at,
        data.status || 'new', data.source || null, data.notes || null,
        now, now
      ]
    );
    return parseProspect(result.rows[0]);
  }

  const db = getSqliteDb();
  const stmt = db.prepare(`
    INSERT INTO prospects (
      id, company_name, contact_name, contact_email, contact_phone,
      industry, business_type, location, team_id,
      services, pain_points, current_tools, monthly_leads, avg_deal_value,
      website_url, google_business_url, social_handles,
      demo_preferences, demo_token, demo_expires_at,
      status, source, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id, data.company_name, data.contact_name, data.contact_email, data.contact_phone || null,
    data.industry, data.business_type, data.location || null, data.team_id || null,
    JSON.stringify(data.services || []), JSON.stringify(data.pain_points || []),
    JSON.stringify(data.current_tools || []), data.monthly_leads || null, data.avg_deal_value || null,
    data.website_url || null, data.google_business_url || null,
    JSON.stringify(data.social_handles || {}),
    JSON.stringify(data.demo_preferences || {}), demo_token, demo_expires_at,
    data.status || 'new', data.source || null, data.notes || null,
    now, now
  );

  return getProspectById(id) as Promise<Prospect>;
}

/**
 * Get prospect by ID
 */
export async function getProspectById(id: string): Promise<Prospect | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM prospects WHERE id = $1', [id]);
    return result.rows.length > 0 ? parseProspect(result.rows[0]) : null;
  }

  const db = getSqliteDb();
  const row = db.prepare('SELECT * FROM prospects WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? parseProspect(row) : null;
}

/**
 * Get prospect by demo token
 */
export async function getProspectByDemoToken(token: string): Promise<Prospect | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'SELECT * FROM prospects WHERE demo_token = $1 AND (demo_expires_at IS NULL OR demo_expires_at > NOW())',
      [token]
    );
    return result.rows.length > 0 ? parseProspect(result.rows[0]) : null;
  }

  const db = getSqliteDb();
  const row = db.prepare(`
    SELECT * FROM prospects
    WHERE demo_token = ?
    AND (demo_expires_at IS NULL OR demo_expires_at > datetime('now'))
  `).get(token) as Record<string, unknown> | undefined;
  return row ? parseProspect(row) : null;
}

/**
 * Get prospect by email
 */
export async function getProspectByEmail(email: string): Promise<Prospect | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM prospects WHERE contact_email = $1', [email]);
    return result.rows.length > 0 ? parseProspect(result.rows[0]) : null;
  }

  const db = getSqliteDb();
  const row = db.prepare('SELECT * FROM prospects WHERE contact_email = ?').get(email) as Record<string, unknown> | undefined;
  return row ? parseProspect(row) : null;
}

/**
 * List all prospects
 */
export async function listProspects(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Prospect[]> {
  const { status, limit = 50, offset = 0 } = options || {};

  if (IS_PRODUCTION && pgPool) {
    let result;
    if (status) {
      result = await pgPool.query(
        'SELECT * FROM prospects WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [status, limit, offset]
      );
    } else {
      result = await pgPool.query(
        'SELECT * FROM prospects ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
    }
    return result.rows.map(parseProspect);
  }

  const db = getSqliteDb();
  let query = 'SELECT * FROM prospects';
  const params: (string | number)[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  return (rows as Record<string, unknown>[]).map(parseProspect);
}

/**
 * Update prospect
 */
export async function updateProspect(id: string, data: Partial<Prospect>): Promise<Prospect | null> {
  const now = new Date().toISOString();

  // Build update fields
  const updates: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  const fields: (keyof Prospect)[] = [
    'company_name', 'contact_name', 'contact_email', 'contact_phone',
    'industry', 'business_type', 'location', 'team_id',
    'website_url', 'google_business_url', 'status', 'source', 'notes',
    'monthly_leads', 'avg_deal_value'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field] as string | number | null);
    }
  }

  // Handle JSON fields
  const jsonFields: (keyof Prospect)[] = ['services', 'pain_points', 'current_tools', 'social_handles', 'demo_preferences'];
  for (const field of jsonFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(JSON.stringify(data[field]));
    }
  }

  values.push(id);

  if (IS_PRODUCTION && pgPool) {
    // For production, build parameterized query with correct indices
    const paramValues = values.slice(0, -1); // Remove the last id (we'll add it properly)
    const paramIndex = paramValues.length + 1;
    const query = `UPDATE prospects SET ${updates.map((u, i) => u.replace('?', `$${i + 1}`)).join(', ')} WHERE id = $${paramIndex}`;
    await pgPool.query(query, [...paramValues, id]);
    return getProspectById(id);
  }

  const db = getSqliteDb();
  const query = `UPDATE prospects SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  return getProspectById(id);
}

/**
 * Delete prospect
 */
export async function deleteProspect(id: string): Promise<boolean> {
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query('DELETE FROM prospects WHERE id = $1', [id]);
    return true;
  }

  const db = getSqliteDb();
  db.prepare('DELETE FROM prospects WHERE id = ?').run(id);
  return true;
}

/**
 * Parse prospect from database row
 */
function parseProspect(row: Record<string, unknown>): Prospect {
  return {
    id: row.id as string,
    company_name: row.company_name as string,
    contact_name: row.contact_name as string,
    contact_email: row.contact_email as string,
    contact_phone: row.contact_phone as string | undefined,
    industry: row.industry as string,
    business_type: row.business_type as string,
    location: row.location as string | undefined,
    team_id: row.team_id as string | undefined,

    services: parseJSON(row.services as string, []),
    pain_points: parseJSON(row.pain_points as string, []),
    current_tools: parseJSON(row.current_tools as string, []),
    monthly_leads: row.monthly_leads as number | undefined,
    avg_deal_value: row.avg_deal_value as number | undefined,

    website_url: row.website_url as string | undefined,
    google_business_url: row.google_business_url as string | undefined,
    social_handles: parseJSON(row.social_handles as string, {}),

    demo_preferences: parseJSON(row.demo_preferences as string, { focus_areas: [] }),
    demo_token: row.demo_token as string | undefined,
    demo_expires_at: row.demo_expires_at as string | undefined,

    status: row.status as Prospect['status'],
    source: row.source as string | undefined,
    notes: row.notes as string | undefined,

    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/**
 * Safely parse JSON
 */
function parseJSON<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Industry configuration for demo personalization
 */
export const INDUSTRY_CONFIG: Record<string, {
  name: string;
  avgDealValue: number;
  avgMonthlyLeads: number;
  commonPainPoints: string[];
  sampleBusinessNames: string[];
  sampleServices: string[];
}> = {
  'home-services': {
    name: 'Home Services',
    avgDealValue: 450,
    avgMonthlyLeads: 30,
    commonPainPoints: ['Missed calls', 'After-hours leads', 'Slow follow-up', 'No-shows'],
    sampleBusinessNames: ['ProPlumb Services', 'Elite HVAC', 'QuickFix Electrical'],
    sampleServices: ['Plumbing', 'HVAC', 'Electrical', 'Roofing', 'Landscaping'],
  },
  'healthcare': {
    name: 'Healthcare',
    avgDealValue: 250,
    avgMonthlyLeads: 50,
    commonPainPoints: ['Appointment scheduling', 'Patient follow-up', 'Review management'],
    sampleBusinessNames: ['Family Dental Care', 'Wellness Chiropractic', 'Premier Med Spa'],
    sampleServices: ['Dental', 'Chiropractic', 'Med Spa', 'Physical Therapy'],
  },
  'professional-services': {
    name: 'Professional Services',
    avgDealValue: 2500,
    avgMonthlyLeads: 15,
    commonPainPoints: ['Lead qualification', 'Long sales cycles', 'Client communication'],
    sampleBusinessNames: ['Summit Law Group', 'Precision Accounting', 'Strategic Consulting'],
    sampleServices: ['Legal', 'Accounting', 'Consulting', 'Marketing Agency'],
  },
  'fitness': {
    name: 'Fitness & Wellness',
    avgDealValue: 150,
    avgMonthlyLeads: 40,
    commonPainPoints: ['Member retention', 'Class scheduling', 'Lead conversion'],
    sampleBusinessNames: ['Peak Fitness Studio', 'Zen Yoga Center', 'CrossFit Elite'],
    sampleServices: ['Personal Training', 'Yoga', 'CrossFit', 'Pilates'],
  },
  'real-estate': {
    name: 'Real Estate',
    avgDealValue: 8000,
    avgMonthlyLeads: 25,
    commonPainPoints: ['Lead response time', 'Follow-up automation', 'CRM management'],
    sampleBusinessNames: ['Premier Realty Group', 'Luxury Homes Team', 'City Living Realtors'],
    sampleServices: ['Residential Sales', 'Commercial', 'Property Management'],
  },
  'restaurant': {
    name: 'Restaurant & Hospitality',
    avgDealValue: 50,
    avgMonthlyLeads: 200,
    commonPainPoints: ['Reservation management', 'Review responses', 'Customer loyalty'],
    sampleBusinessNames: ['Coastal Kitchen', 'Urban Bistro', 'The Garden Table'],
    sampleServices: ['Fine Dining', 'Casual Dining', 'Catering', 'Events'],
  },
  'automotive': {
    name: 'Automotive',
    avgDealValue: 800,
    avgMonthlyLeads: 35,
    commonPainPoints: ['Service scheduling', 'Customer follow-up', 'Review management'],
    sampleBusinessNames: ['Elite Auto Care', 'QuickLube Express', 'Precision Motors'],
    sampleServices: ['Auto Repair', 'Oil Change', 'Detailing', 'Tires'],
  },
  'other': {
    name: 'Other',
    avgDealValue: 500,
    avgMonthlyLeads: 30,
    commonPainPoints: ['Lead capture', 'Follow-up', 'Customer communication'],
    sampleBusinessNames: ['Your Business Name'],
    sampleServices: ['Your Services'],
  },
};
