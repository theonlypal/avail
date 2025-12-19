/**
 * Automation Database Schema - PRODUCTION READY
 *
 * Tables:
 * - automation_rules: Define triggers and actions
 * - automation_templates: Reusable message templates
 * - automation_logs: Track execution history
 * - automation_queue: Scheduled actions pending execution
 */

import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

export function getAutomationDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Create automation_rules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL,
      trigger_config TEXT DEFAULT '{}',
      actions TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      run_count INTEGER DEFAULT 0,
      last_run_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create automation_templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_templates (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create automation_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      action_type TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT,
      error_message TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create automation_queue table for scheduled actions
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_queue (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      action_index INTEGER NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      context TEXT DEFAULT '{}',
      scheduled_for DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_attempt_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_automation_rules_team ON automation_rules(team_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type, is_active)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON automation_logs(rule_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_automation_queue_scheduled ON automation_queue(scheduled_for, status)`);

  return db;
}

// Initialize PostgreSQL tables for production
export async function initAutomationTablesPostgres() {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL,
      trigger_config JSONB DEFAULT '{}',
      actions JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      run_count INTEGER DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS automation_templates (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      action_type TEXT NOT NULL,
      status TEXT NOT NULL,
      result JSONB,
      error_message TEXT,
      executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS automation_queue (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      action_index INTEGER NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      context JSONB DEFAULT '{}',
      scheduled_for TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_attempt_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_automation_rules_team ON automation_rules(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type, is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON automation_logs(rule_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_automation_queue_scheduled ON automation_queue(scheduled_for, status)`;
}

// Types
export type TriggerType =
  | 'lead_created'
  | 'lead_score_changed'
  | 'contact_created'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'form_submitted'
  | 'booking_scheduled'
  | 'no_response'
  | 'tag_added';

export type ActionType =
  | 'send_sms'
  | 'send_email'
  | 'create_task'
  | 'update_stage'
  | 'add_tag'
  | 'remove_tag'
  | 'notify_team'
  | 'webhook';

export interface AutomationAction {
  type: ActionType;
  delay_minutes: number;
  config: {
    template_id?: string;
    message?: string;
    subject?: string;
    task_title?: string;
    task_assignee?: string;
    stage_id?: string;
    tag_id?: string;
    webhook_url?: string;
    notification_channel?: string;
  };
}

export interface AutomationRule {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_config: {
    stage_id?: string;
    tag_id?: string;
    score_threshold?: number;
    days_no_response?: number;
  };
  actions: AutomationAction[];
  is_active: boolean;
  run_count: number;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationTemplate {
  id: string;
  team_id: string;
  name: string;
  type: 'sms' | 'email';
  subject?: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  trigger_type: TriggerType;
  entity_type?: string;
  entity_id?: string;
  action_type: ActionType;
  status: 'success' | 'failed' | 'skipped';
  result?: any;
  error_message?: string;
  executed_at: string;
}
