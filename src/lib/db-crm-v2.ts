/**
 * CRM Database Layer V2 - Enhanced Schema
 *
 * Adds advanced CRM features:
 * - Tags & Contact Tags
 * - Activities/Tasks
 * - Notes
 * - Communications Log
 * - Pipelines (customizable)
 * - Enhanced Contacts & Deals
 * - Segments (Smart Lists)
 * - Custom Field Definitions
 * - Bookings
 * - Automation Templates & Logs
 */

import { Pool } from 'pg';
import path from 'path';
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

const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

export function getSqliteDb(): any {
  if (!sqliteDb) {
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
  }
  return sqliteDb;
}

// ==========================================
// ENHANCED TYPE DEFINITIONS
// ==========================================

export interface Tag {
  id: string;
  team_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface Activity {
  id: string;
  team_id: string;
  type: 'task' | 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  contact_id?: string;
  deal_id?: string;
  lead_id?: string;
  assigned_to?: string;
  due_date?: Date;
  completed_at?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  outcome?: string;
  duration_minutes?: number;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  team_id: string;
  content: string;
  contact_id?: string;
  deal_id?: string;
  lead_id?: string;
  is_pinned: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Communication {
  id: string;
  team_id: string;
  type: 'sms' | 'email' | 'call';
  direction: 'inbound' | 'outbound';
  contact_id?: string;
  deal_id?: string;
  lead_id?: string;
  from_address?: string;
  to_address?: string;
  subject?: string;
  body?: string;
  status: string;
  external_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Pipeline {
  id: string;
  team_id: string;
  name: string;
  is_default: boolean;
  stages: PipelineStage[];
  created_at: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color?: string;
}

export interface Segment {
  id: string;
  team_id: string;
  name: string;
  entity_type: 'contact' | 'deal' | 'lead';
  filters: SegmentFilter[];
  is_dynamic: boolean;
  created_at: Date;
}

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface CustomFieldDefinition {
  id: string;
  team_id: string;
  entity_type: 'contact' | 'deal' | 'lead';
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  options?: string[];
  is_required: boolean;
  display_order: number;
  created_at: Date;
}

export interface Booking {
  id: string;
  team_id: string;
  contact_id?: string;
  lead_id?: string;
  calendar_event_id?: string;
  title: string;
  start_time: Date;
  end_time: Date;
  attendee_email?: string;
  attendee_name?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: Date;
}

export interface CalendarSettings {
  id: string;
  team_id: string;
  provider: 'google' | 'calendly';
  access_token?: string;
  refresh_token?: string;
  calendly_url?: string;
  booking_duration: number;
  buffer_time: number;
  available_hours?: Record<string, { start: string; end: string }>;
  created_at: Date;
  updated_at: Date;
}

export interface AutomationTemplate {
  id: string;
  team_id: string;
  name: string;
  type: 'sms' | 'email';
  subject?: string;
  body: string;
  created_at: Date;
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  lead_id?: string;
  contact_id?: string;
  action_type: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  result?: Record<string, any>;
  scheduled_for?: Date;
  executed_at?: Date;
  created_at: Date;
}

// ==========================================
// SCHEMA INITIALIZATION
// ==========================================

export function initializeCRMV2Schema() {
  const db = getSqliteDb();

  // Tags
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, name)
    )
  `);

  // Contact Tags (junction table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_tags (
      contact_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (contact_id, tag_id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Deal Tags (junction table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS deal_tags (
      deal_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (deal_id, tag_id),
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Activities/Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      contact_id TEXT,
      deal_id TEXT,
      lead_id TEXT,
      assigned_to TEXT,
      due_date DATETIME,
      completed_at DATETIME,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      outcome TEXT,
      duration_minutes INTEGER,
      metadata TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_due ON activities(due_date, status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_assigned ON activities(assigned_to, status)`);

  // Notes
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      content TEXT NOT NULL,
      contact_id TEXT,
      deal_id TEXT,
      lead_id TEXT,
      is_pinned INTEGER DEFAULT 0,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Communications Log
  db.exec(`
    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      type TEXT NOT NULL,
      direction TEXT NOT NULL,
      contact_id TEXT,
      deal_id TEXT,
      lead_id TEXT,
      from_address TEXT,
      to_address TEXT,
      subject TEXT,
      body TEXT,
      status TEXT,
      external_id TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_communications_contact ON communications(contact_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type, created_at)`);

  // Pipelines
  db.exec(`
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      stages TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Segments (Smart Lists)
  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      filters TEXT NOT NULL,
      is_dynamic INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Custom Field Definitions
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_field_definitions (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      field_name TEXT NOT NULL,
      field_type TEXT NOT NULL,
      options TEXT,
      is_required INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, entity_type, field_name)
    )
  `);

  // Bookings
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      contact_id TEXT,
      lead_id TEXT,
      calendar_event_id TEXT,
      title TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      attendee_email TEXT,
      attendee_name TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Calendar Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_settings (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL UNIQUE,
      provider TEXT DEFAULT 'google',
      access_token TEXT,
      refresh_token TEXT,
      calendly_url TEXT,
      booking_duration INTEGER DEFAULT 30,
      buffer_time INTEGER DEFAULT 15,
      available_hours TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Automation Templates
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_templates (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Automation Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      lead_id TEXT,
      contact_id TEXT,
      action_type TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT,
      scheduled_for DATETIME,
      executed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_automation_logs_scheduled ON automation_logs(scheduled_for, status)`);

  // Add new columns to existing tables if they don't exist
  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN company TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN job_title TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN linkedin_url TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN source TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN lifecycle_stage TEXT DEFAULT 'lead'`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN last_contacted_at DATETIME`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN next_follow_up DATETIME`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN owner_id TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE contacts ADD COLUMN custom_fields TEXT DEFAULT '{}'`);
  } catch (e) { /* Column may already exist */ }

  // Enhanced deals columns
  try {
    db.exec(`ALTER TABLE deals ADD COLUMN stage_id TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN probability INTEGER DEFAULT 0`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN expected_close_date DATE`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN lost_reason TEXT`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN won_date DATETIME`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN lost_date DATETIME`);
  } catch (e) { /* Column may already exist */ }

  try {
    db.exec(`ALTER TABLE deals ADD COLUMN custom_fields TEXT DEFAULT '{}'`);
  } catch (e) { /* Column may already exist */ }

  console.log('✅ CRM V2 schema initialized');
}

// ==========================================
// TAG OPERATIONS
// ==========================================

export async function createTag(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO tags (id, team_id, name, color, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, data.team_id, data.name, data.color, now]
    );
    return result.rows[0] as Tag;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO tags (id, team_id, name, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.name, data.color, now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getTagsByTeam(teamId: string): Promise<Tag[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM tags WHERE team_id = $1 ORDER BY name ASC', [teamId]);
    return result.rows as Tag[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM tags WHERE team_id = ? ORDER BY name ASC').all(teamId) as Tag[];
  }
}

export async function addTagToContact(contactId: string, tagId: string): Promise<void> {
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contactId, tagId]);
  } else {
    const db = getSqliteDb();
    db.prepare('INSERT OR IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)').run(contactId, tagId);
  }
}

export async function removeTagFromContact(contactId: string, tagId: string): Promise<void> {
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query('DELETE FROM contact_tags WHERE contact_id = $1 AND tag_id = $2', [contactId, tagId]);
  } else {
    const db = getSqliteDb();
    db.prepare('DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?').run(contactId, tagId);
  }
}

export async function getTagsForContact(contactId: string): Promise<Tag[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'SELECT t.* FROM tags t JOIN contact_tags ct ON t.id = ct.tag_id WHERE ct.contact_id = $1 ORDER BY t.name ASC',
      [contactId]
    );
    return result.rows as Tag[];
  } else {
    const db = getSqliteDb();
    return db.prepare(`
      SELECT t.* FROM tags t
      JOIN contact_tags ct ON t.id = ct.tag_id
      WHERE ct.contact_id = ?
      ORDER BY t.name ASC
    `).all(contactId) as Tag[];
  }
}

// ==========================================
// ACTIVITY OPERATIONS
// ==========================================

export async function createActivity(data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO activities (id, team_id, type, title, description, contact_id, deal_id, lead_id, assigned_to, due_date, completed_at, priority, status, outcome, duration_minutes, metadata, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *',
      [id, data.team_id, data.type, data.title, data.description, data.contact_id, data.deal_id, data.lead_id, data.assigned_to, data.due_date, data.completed_at, data.priority, data.status, data.outcome, data.duration_minutes, JSON.stringify(data.metadata || {}), data.created_by, now, now]
    );
    return result.rows[0] as Activity;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO activities (id, team_id, type, title, description, contact_id, deal_id, lead_id, assigned_to, due_date, completed_at, priority, status, outcome, duration_minutes, metadata, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.team_id, data.type, data.title, data.description || null,
      data.contact_id || null, data.deal_id || null, data.lead_id || null,
      data.assigned_to || null, data.due_date?.toISOString() || null,
      data.completed_at?.toISOString() || null, data.priority, data.status,
      data.outcome || null, data.duration_minutes || null,
      JSON.stringify(data.metadata || {}), data.created_by || null,
      now.toISOString(), now.toISOString()
    );

    return { id, ...data, created_at: now, updated_at: now };
  }
}

export async function getActivitiesByContact(contactId: string): Promise<Activity[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM activities WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]);
    return result.rows as Activity[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM activities WHERE contact_id = ? ORDER BY created_at DESC').all(contactId) as Activity[];
  }
}

export async function getActivitiesByDeal(dealId: string): Promise<Activity[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM activities WHERE deal_id = $1 ORDER BY created_at DESC', [dealId]);
    return result.rows as Activity[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM activities WHERE deal_id = ? ORDER BY created_at DESC').all(dealId) as Activity[];
  }
}

export async function getPendingActivities(teamId: string, assignedTo?: string): Promise<Activity[]> {
  if (IS_PRODUCTION && pgPool) {
    if (assignedTo) {
      const result = await pgPool.query("SELECT * FROM activities WHERE team_id = $1 AND assigned_to = $2 AND status IN ('pending', 'in_progress') ORDER BY due_date ASC NULLS LAST", [teamId, assignedTo]);
      return result.rows as Activity[];
    }
    const result = await pgPool.query("SELECT * FROM activities WHERE team_id = $1 AND status IN ('pending', 'in_progress') ORDER BY due_date ASC NULLS LAST", [teamId]);
    return result.rows as Activity[];
  } else {
    const db = getSqliteDb();
    if (assignedTo) {
      return db.prepare("SELECT * FROM activities WHERE team_id = ? AND assigned_to = ? AND status IN ('pending', 'in_progress') ORDER BY due_date ASC").all(teamId, assignedTo) as Activity[];
    }
    return db.prepare("SELECT * FROM activities WHERE team_id = ? AND status IN ('pending', 'in_progress') ORDER BY due_date ASC").all(teamId) as Activity[];
  }
}

export async function completeActivity(id: string): Promise<void> {
  const now = new Date();
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query("UPDATE activities SET status = 'completed', completed_at = $1, updated_at = $2 WHERE id = $3", [now, now, id]);
  } else {
    const db = getSqliteDb();
    db.prepare("UPDATE activities SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?").run(now.toISOString(), now.toISOString(), id);
  }
}

// ==========================================
// NOTE OPERATIONS
// ==========================================

export async function createNote(data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO notes (id, team_id, content, contact_id, deal_id, lead_id, is_pinned, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id, data.team_id, data.content, data.contact_id, data.deal_id, data.lead_id, data.is_pinned, data.created_by, now, now]
    );
    return result.rows[0] as Note;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO notes (id, team_id, content, contact_id, deal_id, lead_id, is_pinned, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.content, data.contact_id || null, data.deal_id || null, data.lead_id || null, data.is_pinned ? 1 : 0, data.created_by || null, now.toISOString(), now.toISOString());

    return { id, ...data, created_at: now, updated_at: now };
  }
}

export async function getNotesByContact(contactId: string): Promise<Note[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM notes WHERE contact_id = $1 ORDER BY is_pinned DESC, created_at DESC', [contactId]);
    return result.rows as Note[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM notes WHERE contact_id = ? ORDER BY is_pinned DESC, created_at DESC').all(contactId) as Note[];
  }
}

export async function getNotesByDeal(dealId: string): Promise<Note[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM notes WHERE deal_id = $1 ORDER BY is_pinned DESC, created_at DESC', [dealId]);
    return result.rows as Note[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM notes WHERE deal_id = ? ORDER BY is_pinned DESC, created_at DESC').all(dealId) as Note[];
  }
}

// ==========================================
// COMMUNICATION OPERATIONS
// ==========================================

export async function createCommunication(data: Omit<Communication, 'id' | 'created_at'>): Promise<Communication> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO communications (id, team_id, type, direction, contact_id, deal_id, lead_id, from_address, to_address, subject, body, status, external_id, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
      [id, data.team_id, data.type, data.direction, data.contact_id, data.deal_id, data.lead_id, data.from_address, data.to_address, data.subject, data.body, data.status, data.external_id, JSON.stringify(data.metadata || {}), now]
    );
    return result.rows[0] as Communication;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO communications (id, team_id, type, direction, contact_id, deal_id, lead_id, from_address, to_address, subject, body, status, external_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.type, data.direction, data.contact_id || null, data.deal_id || null, data.lead_id || null, data.from_address || null, data.to_address || null, data.subject || null, data.body || null, data.status, data.external_id || null, JSON.stringify(data.metadata || {}), now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getCommunicationsByContact(contactId: string): Promise<Communication[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM communications WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]);
    return result.rows as Communication[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM communications WHERE contact_id = ? ORDER BY created_at DESC').all(contactId) as Communication[];
  }
}

// ==========================================
// PIPELINE OPERATIONS
// ==========================================

export async function createPipeline(data: Omit<Pipeline, 'id' | 'created_at'>): Promise<Pipeline> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO pipelines (id, team_id, name, is_default, stages, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, data.team_id, data.name, data.is_default, JSON.stringify(data.stages), now]
    );
    return { ...result.rows[0], stages: JSON.parse(result.rows[0].stages) } as Pipeline;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO pipelines (id, team_id, name, is_default, stages, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.name, data.is_default ? 1 : 0, JSON.stringify(data.stages), now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getPipelinesByTeam(teamId: string): Promise<Pipeline[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM pipelines WHERE team_id = $1 ORDER BY is_default DESC, name ASC', [teamId]);
    return result.rows.map((p: any) => ({ ...p, stages: JSON.parse(p.stages as string) })) as Pipeline[];
  } else {
    const db = getSqliteDb();
    const result = db.prepare('SELECT * FROM pipelines WHERE team_id = ? ORDER BY is_default DESC, name ASC').all(teamId) as any[];
    return result.map(p => ({ ...p, stages: JSON.parse(p.stages) })) as Pipeline[];
  }
}

export async function getDefaultPipeline(teamId: string): Promise<Pipeline | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM pipelines WHERE team_id = $1 AND is_default = true LIMIT 1', [teamId]);
    if (result.rows.length === 0) return null;
    return { ...result.rows[0], stages: JSON.parse(result.rows[0].stages as string) } as Pipeline;
  } else {
    const db = getSqliteDb();
    const result = db.prepare('SELECT * FROM pipelines WHERE team_id = ? AND is_default = 1 LIMIT 1').get(teamId) as any;
    if (!result) return null;
    return { ...result, stages: JSON.parse(result.stages) } as Pipeline;
  }
}

// ==========================================
// BOOKING OPERATIONS
// ==========================================

export async function createBooking(data: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO bookings (id, team_id, contact_id, lead_id, calendar_event_id, title, start_time, end_time, attendee_email, attendee_name, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [id, data.team_id, data.contact_id, data.lead_id, data.calendar_event_id, data.title, data.start_time, data.end_time, data.attendee_email, data.attendee_name, data.status, data.notes, now]
    );
    return result.rows[0] as Booking;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO bookings (id, team_id, contact_id, lead_id, calendar_event_id, title, start_time, end_time, attendee_email, attendee_name, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.contact_id || null, data.lead_id || null, data.calendar_event_id || null, data.title, data.start_time.toISOString(), data.end_time.toISOString(), data.attendee_email || null, data.attendee_name || null, data.status, data.notes || null, now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getBookingsByTeam(teamId: string, limit = 100): Promise<Booking[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM bookings WHERE team_id = $1 ORDER BY start_time DESC LIMIT $2', [teamId, limit]);
    return result.rows as Booking[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM bookings WHERE team_id = ? ORDER BY start_time DESC LIMIT ?').all(teamId, limit) as Booking[];
  }
}

export async function getUpcomingBookings(teamId: string): Promise<Booking[]> {
  const now = new Date();
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query("SELECT * FROM bookings WHERE team_id = $1 AND start_time >= $2 AND status = 'scheduled' ORDER BY start_time ASC", [teamId, now]);
    return result.rows as Booking[];
  } else {
    const db = getSqliteDb();
    return db.prepare("SELECT * FROM bookings WHERE team_id = ? AND start_time >= ? AND status = 'scheduled' ORDER BY start_time ASC").all(teamId, now.toISOString()) as Booking[];
  }
}

// ==========================================
// AUTOMATION TEMPLATE OPERATIONS
// ==========================================

export async function createAutomationTemplate(data: Omit<AutomationTemplate, 'id' | 'created_at'>): Promise<AutomationTemplate> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO automation_templates (id, team_id, name, type, subject, body, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, data.team_id, data.name, data.type, data.subject, data.body, now]
    );
    return result.rows[0] as AutomationTemplate;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO automation_templates (id, team_id, name, type, subject, body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.team_id, data.name, data.type, data.subject || null, data.body, now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getAutomationTemplatesByTeam(teamId: string): Promise<AutomationTemplate[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM automation_templates WHERE team_id = $1 ORDER BY name ASC', [teamId]);
    return result.rows as AutomationTemplate[];
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM automation_templates WHERE team_id = ? ORDER BY name ASC').all(teamId) as AutomationTemplate[];
  }
}

// ==========================================
// AUTOMATION LOG OPERATIONS
// ==========================================

export async function createAutomationLog(data: Omit<AutomationLog, 'id' | 'created_at'>): Promise<AutomationLog> {
  const id = uuidv4();
  const now = new Date();

  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'INSERT INTO automation_logs (id, rule_id, lead_id, contact_id, action_type, status, result, scheduled_for, executed_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id, data.rule_id, data.lead_id, data.contact_id, data.action_type, data.status, JSON.stringify(data.result || {}), data.scheduled_for, data.executed_at, now]
    );
    return result.rows[0] as AutomationLog;
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO automation_logs (id, rule_id, lead_id, contact_id, action_type, status, result, scheduled_for, executed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.rule_id, data.lead_id || null, data.contact_id || null, data.action_type, data.status, JSON.stringify(data.result || {}), data.scheduled_for?.toISOString() || null, data.executed_at?.toISOString() || null, now.toISOString());

    return { id, ...data, created_at: now };
  }
}

export async function getPendingAutomationLogs(): Promise<AutomationLog[]> {
  const now = new Date();
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query("SELECT * FROM automation_logs WHERE status = 'pending' AND scheduled_for <= $1 ORDER BY scheduled_for ASC", [now]);
    return result.rows as AutomationLog[];
  } else {
    const db = getSqliteDb();
    return db.prepare("SELECT * FROM automation_logs WHERE status = 'pending' AND scheduled_for <= ? ORDER BY scheduled_for ASC").all(now.toISOString()) as AutomationLog[];
  }
}

export async function updateAutomationLogStatus(id: string, status: string, result?: Record<string, any>): Promise<void> {
  const now = new Date();
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query('UPDATE automation_logs SET status = $1, result = $2, executed_at = $3 WHERE id = $4', [status, JSON.stringify(result || {}), now, id]);
  } else {
    const db = getSqliteDb();
    db.prepare('UPDATE automation_logs SET status = ?, result = ?, executed_at = ? WHERE id = ?').run(status, JSON.stringify(result || {}), now.toISOString(), id);
  }
}

// Initialize schema on import
if (!IS_PRODUCTION) {
  try {
    initializeCRMV2Schema();
  } catch (e) {
    console.error('Failed to initialize CRM V2 schema:', e);
  }
}
