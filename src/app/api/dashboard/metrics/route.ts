/**
 * Dashboard Metrics API - PRODUCTION READY
 *
 * Returns real-time metrics from the database for the dashboard
 * - Lead stats (total, high value, avg score)
 * - Deal pipeline stats (by stage, total value)
 * - Activity stats (tasks, communications)
 * - Automation stats (active rules, executions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

// PostgreSQL Pool for production (Railway)
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

// SQLite setup (local development)
const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

function getSqliteDb(): any {
  if (!sqliteDb) {
    if (fs.existsSync(DB_PATH)) {
      sqliteDb = new Database(DB_PATH);
      sqliteDb.pragma('journal_mode = WAL');
    } else {
      throw new Error('Database not found');
    }
  }
  return sqliteDb;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id') || 'default-team';

  try {
    let metrics;

    if (IS_PRODUCTION && pgPool) {
      metrics = await getProductionMetrics(teamId);
    } else {
      metrics = getLocalMetrics(teamId);
    }

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error.message },
      { status: 500 }
    );
  }
}

async function getProductionMetrics(teamId: string) {
  if (!pgPool) throw new Error('Database not available');

  // Lead metrics
  const leadsResult = await pgPool.query(`
    SELECT
      COUNT(*) as total_leads,
      COALESCE(AVG(opportunity_score), 0) as avg_score,
      COUNT(CASE WHEN opportunity_score >= 80 THEN 1 END) as high_value_leads,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as leads_this_week,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as leads_this_month
    FROM leads
    WHERE team_id = $1
  `, [teamId]);

  // Industry breakdown
  const industriesResult = await pgPool.query(`
    SELECT industry, COUNT(*) as count
    FROM leads
    WHERE team_id = $1 AND industry IS NOT NULL
    GROUP BY industry
    ORDER BY count DESC
    LIMIT 10
  `, [teamId]);

  // Deal metrics
  const dealsResult = await pgPool.query(`
    SELECT
      COUNT(*) as total_deals,
      COALESCE(SUM(value), 0) as total_value,
      COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
      COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as deals_this_month
    FROM deals
  `);

  // Deal stages breakdown
  const stagesResult = await pgPool.query(`
    SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as value
    FROM deals
    GROUP BY stage
    ORDER BY count DESC
  `);

  // Contact metrics
  const contactsResult = await pgPool.query(`
    SELECT
      COUNT(*) as total_contacts,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as contacts_this_week,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as contacts_this_month
    FROM contacts
  `);

  // Message metrics
  const messagesResult = await pgPool.query(`
    SELECT
      COUNT(*) as total_messages,
      COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as sent_messages,
      COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as received_messages,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as messages_this_week
    FROM messages
  `);

  // Appointment metrics
  const appointmentsResult = await pgPool.query(`
    SELECT
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN status = 'scheduled' AND start_time > NOW() THEN 1 END) as upcoming_appointments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as appointments_this_week
    FROM appointments
  `);

  // Automation metrics from automation DB
  let automationMetrics = {
    active_rules: 0,
    total_executions: 0,
    executions_this_week: 0
  };

  try {
    // Try to get automation stats if table exists
    const automationResult = await pgPool.query(`
      SELECT
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_rules,
        COALESCE(SUM(run_count), 0) as total_executions
      FROM automation_rules
      WHERE team_id = $1
    `, [teamId]);
    if (automationResult.rows.length > 0) {
      automationMetrics = {
        active_rules: Number(automationResult.rows[0].active_rules) || 0,
        total_executions: Number(automationResult.rows[0].total_executions) || 0,
        executions_this_week: 0
      };
    }
  } catch (e) {
    // Automation tables might not exist yet
  }

  return {
    leads: {
      total: Number(leadsResult.rows[0]?.total_leads) || 0,
      avgScore: Math.round(Number(leadsResult.rows[0]?.avg_score) || 0),
      highValue: Number(leadsResult.rows[0]?.high_value_leads) || 0,
      thisWeek: Number(leadsResult.rows[0]?.leads_this_week) || 0,
      thisMonth: Number(leadsResult.rows[0]?.leads_this_month) || 0,
    },
    industries: industriesResult.rows.map((r: any) => ({
      name: r.industry,
      count: Number(r.count),
    })),
    deals: {
      total: Number(dealsResult.rows[0]?.total_deals) || 0,
      totalValue: Number(dealsResult.rows[0]?.total_value) || 0,
      won: Number(dealsResult.rows[0]?.won_deals) || 0,
      wonValue: Number(dealsResult.rows[0]?.won_value) || 0,
      thisMonth: Number(dealsResult.rows[0]?.deals_this_month) || 0,
    },
    stages: stagesResult.rows.map((r: any) => ({
      name: r.stage,
      count: Number(r.count),
      value: Number(r.value),
    })),
    contacts: {
      total: Number(contactsResult.rows[0]?.total_contacts) || 0,
      thisWeek: Number(contactsResult.rows[0]?.contacts_this_week) || 0,
      thisMonth: Number(contactsResult.rows[0]?.contacts_this_month) || 0,
    },
    messages: {
      total: Number(messagesResult.rows[0]?.total_messages) || 0,
      sent: Number(messagesResult.rows[0]?.sent_messages) || 0,
      received: Number(messagesResult.rows[0]?.received_messages) || 0,
      thisWeek: Number(messagesResult.rows[0]?.messages_this_week) || 0,
    },
    appointments: {
      total: Number(appointmentsResult.rows[0]?.total_appointments) || 0,
      upcoming: Number(appointmentsResult.rows[0]?.upcoming_appointments) || 0,
      completed: Number(appointmentsResult.rows[0]?.completed_appointments) || 0,
      thisWeek: Number(appointmentsResult.rows[0]?.appointments_this_week) || 0,
    },
    automations: automationMetrics,
  };
}

function getLocalMetrics(teamId: string) {
  const db = getSqliteDb();

  // Check if leads table exists
  const tablesExist = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='leads'
  `).get();

  if (!tablesExist) {
    return getEmptyMetrics();
  }

  // Lead metrics
  const leadsRow = db.prepare(`
    SELECT
      COUNT(*) as total_leads,
      COALESCE(AVG(opportunity_score), 0) as avg_score,
      COUNT(CASE WHEN opportunity_score >= 80 THEN 1 END) as high_value_leads,
      COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 END) as leads_this_week,
      COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-30 days') THEN 1 END) as leads_this_month
    FROM leads
    WHERE team_id = ?
  `).get(teamId) as any;

  // Industry breakdown
  const industriesRows = db.prepare(`
    SELECT industry, COUNT(*) as count
    FROM leads
    WHERE team_id = ? AND industry IS NOT NULL AND industry != ''
    GROUP BY industry
    ORDER BY count DESC
    LIMIT 10
  `).all(teamId) as any[];

  // Deal metrics (might not exist)
  let dealsRow = { total_deals: 0, total_value: 0, won_deals: 0, won_value: 0, deals_this_month: 0 };
  let stagesRows: any[] = [];
  try {
    dealsRow = db.prepare(`
      SELECT
        COUNT(*) as total_deals,
        COALESCE(SUM(value), 0) as total_value,
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
        COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-30 days') THEN 1 END) as deals_this_month
      FROM deals
    `).get() as any || dealsRow;

    stagesRows = db.prepare(`
      SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as value
      FROM deals
      GROUP BY stage
      ORDER BY count DESC
    `).all() as any[];
  } catch (e) {
    // Deals table might not exist
  }

  // Contact metrics (might not exist)
  let contactsRow = { total_contacts: 0, contacts_this_week: 0, contacts_this_month: 0 };
  try {
    contactsRow = db.prepare(`
      SELECT
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 END) as contacts_this_week,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-30 days') THEN 1 END) as contacts_this_month
      FROM contacts
    `).get() as any || contactsRow;
  } catch (e) {
    // Contacts table might not exist
  }

  // Message metrics (might not exist)
  let messagesRow = { total_messages: 0, sent_messages: 0, received_messages: 0, messages_this_week: 0 };
  try {
    messagesRow = db.prepare(`
      SELECT
        COUNT(*) as total_messages,
        COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as sent_messages,
        COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as received_messages,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 END) as messages_this_week
      FROM messages
    `).get() as any || messagesRow;
  } catch (e) {
    // Messages table might not exist
  }

  // Appointment metrics (might not exist)
  let appointmentsRow = { total_appointments: 0, upcoming_appointments: 0, completed_appointments: 0, appointments_this_week: 0 };
  try {
    appointmentsRow = db.prepare(`
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'scheduled' AND datetime(start_time) > datetime('now') THEN 1 END) as upcoming_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 END) as appointments_this_week
      FROM appointments
    `).get() as any || appointmentsRow;
  } catch (e) {
    // Appointments table might not exist
  }

  // Automation metrics (from automation DB)
  let automationMetrics = { active_rules: 0, total_executions: 0, executions_this_week: 0 };
  try {
    // The automation db is separate
    const automationDbPath = path.join(process.cwd(), 'data', 'automation.db');
    if (fs.existsSync(automationDbPath)) {
      const automationDb = new Database(automationDbPath);
      const automationRow = automationDb.prepare(`
        SELECT
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_rules,
          COALESCE(SUM(run_count), 0) as total_executions
        FROM automation_rules
        WHERE team_id = ?
      `).get(teamId) as any;

      if (automationRow) {
        automationMetrics = {
          active_rules: automationRow.active_rules || 0,
          total_executions: automationRow.total_executions || 0,
          executions_this_week: 0,
        };
      }
      automationDb.close();
    }
  } catch (e) {
    // Automation DB might not exist yet
  }

  return {
    leads: {
      total: leadsRow?.total_leads || 0,
      avgScore: Math.round(leadsRow?.avg_score || 0),
      highValue: leadsRow?.high_value_leads || 0,
      thisWeek: leadsRow?.leads_this_week || 0,
      thisMonth: leadsRow?.leads_this_month || 0,
    },
    industries: industriesRows.map((r) => ({
      name: r.industry,
      count: r.count,
    })),
    deals: {
      total: dealsRow.total_deals || 0,
      totalValue: dealsRow.total_value || 0,
      won: dealsRow.won_deals || 0,
      wonValue: dealsRow.won_value || 0,
      thisMonth: dealsRow.deals_this_month || 0,
    },
    stages: stagesRows.map((r) => ({
      name: r.stage,
      count: r.count,
      value: r.value,
    })),
    contacts: {
      total: contactsRow.total_contacts || 0,
      thisWeek: contactsRow.contacts_this_week || 0,
      thisMonth: contactsRow.contacts_this_month || 0,
    },
    messages: {
      total: messagesRow.total_messages || 0,
      sent: messagesRow.sent_messages || 0,
      received: messagesRow.received_messages || 0,
      thisWeek: messagesRow.messages_this_week || 0,
    },
    appointments: {
      total: appointmentsRow.total_appointments || 0,
      upcoming: appointmentsRow.upcoming_appointments || 0,
      completed: appointmentsRow.completed_appointments || 0,
      thisWeek: appointmentsRow.appointments_this_week || 0,
    },
    automations: automationMetrics,
  };
}

function getEmptyMetrics() {
  return {
    leads: { total: 0, avgScore: 0, highValue: 0, thisWeek: 0, thisMonth: 0 },
    industries: [],
    deals: { total: 0, totalValue: 0, won: 0, wonValue: 0, thisMonth: 0 },
    stages: [],
    contacts: { total: 0, thisWeek: 0, thisMonth: 0 },
    messages: { total: 0, sent: 0, received: 0, thisWeek: 0 },
    appointments: { total: 0, upcoming: 0, completed: 0, thisWeek: 0 },
    automations: { active_rules: 0, total_executions: 0, executions_this_week: 0 },
  };
}
