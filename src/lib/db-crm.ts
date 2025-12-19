/**
 * CRM Database Layer - PRODUCTION READY
 *
 * Extends existing db.ts with CRM-specific tables
 * Works with PostgreSQL (Railway production) and SQLite (development)
 */

import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
    initializeCRMSchema();
  }
  return sqliteDb;
}

/**
 * Initialize CRM schema (adds to existing schema)
 */
function initializeCRMSchema() {
  const db = getSqliteDb();

  // Businesses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      industry TEXT,
      phone TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      logo_url TEXT,
      brand_colors TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      title TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);

  // Deals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'new',
      value REAL DEFAULT 0,
      source TEXT,
      created_by TEXT,
      pipeline_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      location TEXT,
      notes TEXT,
      status TEXT DEFAULT 'scheduled',
      google_calendar_event_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);

  // Messages table (SMS/Email)
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      contact_id TEXT,
      direction TEXT NOT NULL,
      channel TEXT NOT NULL,
      from_number TEXT,
      to_number TEXT,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      twilio_sid TEXT,
      postmark_message_id TEXT,
      metadata TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
    )
  `);

  // Automation Rules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_value TEXT,
      action_type TEXT NOT NULL,
      action_config TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Review Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_requests (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      business_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      platform TEXT,
      review_url TEXT,
      sent_at DATETIME,
      responded_at DATETIME,
      rating INTEGER,
      review_text TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ CRM schema initialized');
}

/**
 * Initialize Postgres CRM schema (production only)
 */
export async function initializePostgresCRMSchema() {
  if (!pgPool) {
    throw new Error('Postgres not configured. Set POSTGRES_URL environment variable.');
  }

  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        industry TEXT,
        phone TEXT,
        website TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        logo_url TEXT,
        brand_colors TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        title TEXT,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        stage TEXT NOT NULL DEFAULT 'new',
        value DECIMAL DEFAULT 0,
        source TEXT,
        created_by TEXT,
        pipeline_id TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        google_calendar_event_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        contact_id TEXT,
        direction TEXT NOT NULL,
        channel TEXT NOT NULL,
        from_number TEXT,
        to_number TEXT,
        body TEXT NOT NULL,
        status TEXT DEFAULT 'sent',
        twilio_sid TEXT,
        postmark_message_id TEXT,
        metadata JSONB,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        trigger_type TEXT NOT NULL,
        trigger_value TEXT,
        action_type TEXT NOT NULL,
        action_config JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        platform TEXT,
        review_url TEXT,
        sent_at TIMESTAMP,
        responded_at TIMESTAMP,
        rating INTEGER,
        review_text TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Postgres CRM schema initialized');
  } finally {
    client.release();
  }
}

// CRM Data Types
export interface Business {
  id: string;
  team_id: string;
  name: string;
  industry?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  logo_url?: string;
  brand_colors?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Deal {
  id: string;
  contact_id: string;
  stage: string;
  value: number;
  source?: string;
  created_by?: string;
  pipeline_id?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  contact_id: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  notes?: string;
  status: string;
  google_calendar_event_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  contact_id: string | null; // Nullable for inbound messages from unknown contacts
  direction: 'inbound' | 'outbound';
  channel: 'sms' | 'email';
  from_number?: string; // For SMS
  to_number?: string; // For SMS
  body: string;
  status: string;
  twilio_sid?: string;
  postmark_message_id?: string;
  metadata?: Record<string, any>; // Additional webhook data
  sent_at: Date;
  created_at: Date;
}

export interface AutomationRule {
  id: string;
  team_id: string;
  name: string;
  trigger_type: string; // 'deal_stage_change', 'appointment_scheduled', 'message_received', etc.
  trigger_value?: string; // e.g., stage name for deal_stage_change
  action_type: string; // 'send_sms', 'send_email', 'create_task', etc.
  action_config: Record<string, any>; // Configuration for the action
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewRequest {
  id: string;
  contact_id: string;
  business_id: string;
  channel: 'sms' | 'email';
  status: 'pending' | 'sent' | 'responded' | 'declined';
  platform?: string; // 'google', 'yelp', 'facebook', etc.
  review_url?: string;
  sent_at?: Date;
  responded_at?: Date;
  rating?: number; // 1-5
  review_text?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

/**
 * CRM Database Operations
 */

// Business operations
export async function createBusiness(data: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO businesses (id, team_id, name, industry, phone, website, address, city, state, zip, logo_url, brand_colors, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [id, data.team_id, data.name, data.industry, data.phone, data.website, data.address, data.city, data.state, data.zip, data.logo_url, data.brand_colors, JSON.stringify(data.metadata || {}), now, now]
    );
    return result.rows[0] as Business;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO businesses (id, team_id, name, industry, phone, website, address, city, state, zip, logo_url, brand_colors, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.name, data.industry, data.phone, data.website, data.address, data.city, data.state, data.zip, data.logo_url, data.brand_colors, JSON.stringify(data.metadata || {}), now.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Contact operations
export async function createContact(data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO contacts (id, business_id, first_name, last_name, email, phone, title, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, data.business_id, data.first_name, data.last_name, data.email, data.phone, data.title, JSON.stringify(data.tags || []), now, now]
    );
    return result.rows[0] as Contact;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO contacts (id, business_id, first_name, last_name, email, phone, title, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.business_id, data.first_name, data.last_name, data.email, data.phone, data.title, JSON.stringify(data.tags || []), now.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Deal operations
export async function createDeal(data: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO deals (id, contact_id, stage, value, source, created_by, pipeline_id, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, data.contact_id, data.stage, data.value, data.source, data.created_by, data.pipeline_id, data.notes, now, now]
    );
    return result.rows[0] as Deal;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO deals (id, contact_id, stage, value, source, created_by, pipeline_id, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.contact_id, data.stage, data.value, data.source, data.created_by, data.pipeline_id, data.notes, now.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

// Message operations
export async function createMessage(data: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  const id = uuidv4();
  const now = new Date();
  const sentAt = data.sent_at || now;

  if (IS_PRODUCTION && pgPool) {
    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;
    const result = await pgPool.query(
      `INSERT INTO messages (id, contact_id, direction, channel, from_number, to_number, body, status, twilio_sid, postmark_message_id, metadata, sent_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [id, data.contact_id, data.direction, data.channel, data.from_number, data.to_number, data.body, data.status, data.twilio_sid, data.postmark_message_id, metadataJson, sentAt, now]
    );
    return result.rows[0] as Message;
  } else {
    const db = getSqliteDb();
    const metadataString = data.metadata ? JSON.stringify(data.metadata) : null;
    db.prepare(`
      INSERT INTO messages (id, contact_id, direction, channel, from_number, to_number, body, status, twilio_sid, postmark_message_id, metadata, sent_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.contact_id, data.direction, data.channel, data.from_number, data.to_number, data.body, data.status, data.twilio_sid, data.postmark_message_id, metadataString, sentAt.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      sent_at: sentAt,
      created_at: now,
    };
  }
}

// Get operations
export async function getBusinessById(id: string): Promise<Business | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM businesses WHERE id = $1', [id]);
    return result.rows[0] as Business || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM businesses WHERE id = ?').get(id) as Business || null;
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM contacts WHERE id = $1', [id]);
    return result.rows[0] as Contact || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact || null;
  }
}

export async function getContactsByBusiness(businessId: string): Promise<Contact[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM contacts WHERE business_id = $1 ORDER BY created_at DESC', [businessId]);
    return result.rows as Contact[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM contacts WHERE business_id = ? ORDER BY created_at DESC').all(businessId) as Contact[];
  }
}

export async function getDealsByContact(contactId: string): Promise<Deal[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM deals WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]);
    return result.rows as Deal[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM deals WHERE contact_id = ? ORDER BY created_at DESC').all(contactId) as Deal[];
  }
}

export async function getMessagesByContact(contactId: string): Promise<Message[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM messages WHERE contact_id = $1 ORDER BY sent_at DESC', [contactId]);
    return result.rows as Message[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM messages WHERE contact_id = ? ORDER BY sent_at DESC').all(contactId) as Message[];
  }
}

// Appointment operations
export async function createAppointment(data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO appointments (id, contact_id, start_time, end_time, location, notes, status, google_calendar_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, data.contact_id, data.start_time, data.end_time, data.location, data.notes, data.status, data.google_calendar_event_id, now, now]
    );
    return result.rows[0] as Appointment;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO appointments (id, contact_id, start_time, end_time, location, notes, status, google_calendar_event_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.contact_id, data.start_time.toISOString(), data.end_time.toISOString(), data.location, data.notes, data.status, data.google_calendar_event_id, now.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    return result.rows[0] as Appointment || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as Appointment || null;
  }
}

export async function getAppointmentsByContact(contactId: string): Promise<Appointment[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM appointments WHERE contact_id = $1 ORDER BY start_time ASC', [contactId]);
    return result.rows as Appointment[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM appointments WHERE contact_id = ? ORDER BY start_time ASC').all(contactId) as Appointment[];
  }
}

export async function getAllAppointments(limit: number = 100, offset: number = 0): Promise<Appointment[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM appointments ORDER BY start_time ASC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows as Appointment[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM appointments ORDER BY start_time ASC LIMIT ? OFFSET ?').all(limit, offset) as Appointment[];
  }
}

// Automation Rule operations
export async function createAutomationRule(data: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO automation_rules (id, team_id, name, trigger_type, trigger_value, action_type, action_config, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, data.team_id, data.name, data.trigger_type, data.trigger_value, data.action_type, JSON.stringify(data.action_config), data.is_active, now, now]
    );
    return result.rows[0] as AutomationRule;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO automation_rules (id, team_id, name, trigger_type, trigger_value, action_type, action_config, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.name, data.trigger_type, data.trigger_value, data.action_type, JSON.stringify(data.action_config), data.is_active ? 1 : 0, now.toISOString(), now.toISOString());

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

export async function getAutomationRulesByTeam(teamId: string): Promise<AutomationRule[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM automation_rules WHERE team_id = $1 ORDER BY created_at DESC', [teamId]);
    return result.rows as AutomationRule[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM automation_rules WHERE team_id = ? ORDER BY created_at DESC').all(teamId) as AutomationRule[];
  }
}

export async function updateAutomationRule(id: string, data: Partial<Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push('name = $' + (values.length + 1)); values.push(data.name); }
    if (data.trigger_type !== undefined) { updates.push('trigger_type = $' + (values.length + 1)); values.push(data.trigger_type); }
    if (data.trigger_value !== undefined) { updates.push('trigger_value = $' + (values.length + 1)); values.push(data.trigger_value); }
    if (data.action_type !== undefined) { updates.push('action_type = $' + (values.length + 1)); values.push(data.action_type); }
    if (data.action_config !== undefined) { updates.push('action_config = $' + (values.length + 1)); values.push(JSON.stringify(data.action_config)); }
    if (data.is_active !== undefined) { updates.push('is_active = $' + (values.length + 1)); values.push(data.is_active); }

    updates.push('updated_at = $' + (values.length + 1));
    values.push(now);
    values.push(id);

    const setClause = updates.join(', ');
    await pgPool.query(`UPDATE automation_rules SET ${setClause} WHERE id = $${values.length}`, values);
  } else {
    const db = getSqliteDb();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.trigger_type !== undefined) { updates.push('trigger_type = ?'); values.push(data.trigger_type); }
    if (data.trigger_value !== undefined) { updates.push('trigger_value = ?'); values.push(data.trigger_value); }
    if (data.action_type !== undefined) { updates.push('action_type = ?'); values.push(data.action_type); }
    if (data.action_config !== undefined) { updates.push('action_config = ?'); values.push(JSON.stringify(data.action_config)); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }

    updates.push('updated_at = ?');
    values.push(now.toISOString());
    values.push(id);

    db.prepare(`UPDATE automation_rules SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
}

// Review Request operations
export async function createReviewRequest(data: Omit<ReviewRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ReviewRequest> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      `INSERT INTO review_requests (id, contact_id, business_id, channel, status, platform, review_url, sent_at, responded_at, rating, review_text, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [id, data.contact_id, data.business_id, data.channel, data.status, data.platform, data.review_url, data.sent_at, data.responded_at, data.rating, data.review_text, JSON.stringify(data.metadata || {}), now, now]
    );
    return result.rows[0] as ReviewRequest;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO review_requests (id, contact_id, business_id, channel, status, platform, review_url, sent_at, responded_at, rating, review_text, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.contact_id,
      data.business_id,
      data.channel,
      data.status,
      data.platform || null,
      data.review_url || null,
      data.sent_at ? data.sent_at.toISOString() : null,
      data.responded_at ? data.responded_at.toISOString() : null,
      data.rating || null,
      data.review_text || null,
      JSON.stringify(data.metadata || {}),
      now.toISOString(),
      now.toISOString()
    );

    return {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };
  }
}

export async function getReviewRequestsByBusiness(businessId: string): Promise<ReviewRequest[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM review_requests WHERE business_id = $1 ORDER BY created_at DESC', [businessId]);
    return result.rows as ReviewRequest[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM review_requests WHERE business_id = ? ORDER BY created_at DESC').all(businessId) as ReviewRequest[];
  }
}

export async function getReviewRequestsByContact(contactId: string): Promise<ReviewRequest[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM review_requests WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]);
    return result.rows as ReviewRequest[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM review_requests WHERE contact_id = ? ORDER BY created_at DESC').all(contactId) as ReviewRequest[];
  }
}

export async function updateReviewRequest(id: string, data: Partial<Omit<ReviewRequest, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) { updates.push('status = $' + (values.length + 1)); values.push(data.status); }
    if (data.sent_at !== undefined) { updates.push('sent_at = $' + (values.length + 1)); values.push(data.sent_at); }
    if (data.responded_at !== undefined) { updates.push('responded_at = $' + (values.length + 1)); values.push(data.responded_at); }
    if (data.rating !== undefined) { updates.push('rating = $' + (values.length + 1)); values.push(data.rating); }
    if (data.review_text !== undefined) { updates.push('review_text = $' + (values.length + 1)); values.push(data.review_text); }
    if (data.metadata !== undefined) { updates.push('metadata = $' + (values.length + 1)); values.push(JSON.stringify(data.metadata)); }

    updates.push('updated_at = $' + (values.length + 1));
    values.push(now);
    values.push(id);

    const setClause = updates.join(', ');
    await pgPool.query(`UPDATE review_requests SET ${setClause} WHERE id = $${values.length}`, values);
  } else {
    const db = getSqliteDb();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
    if (data.sent_at !== undefined) { updates.push('sent_at = ?'); values.push(data.sent_at ? data.sent_at.toISOString() : null); }
    if (data.responded_at !== undefined) { updates.push('responded_at = ?'); values.push(data.responded_at ? data.responded_at.toISOString() : null); }
    if (data.rating !== undefined) { updates.push('rating = ?'); values.push(data.rating); }
    if (data.review_text !== undefined) { updates.push('review_text = ?'); values.push(data.review_text); }
    if (data.metadata !== undefined) { updates.push('metadata = ?'); values.push(JSON.stringify(data.metadata)); }

    updates.push('updated_at = ?');
    values.push(now.toISOString());
    values.push(id);

    db.prepare(`UPDATE review_requests SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
}
