/**
 * Activities API Route - PRODUCTION READY
 *
 * GET: List activities (with optional filtering)
 * POST: Create new activity/task
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Ensure activities table exists
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

  return db;
}

/**
 * GET /api/activities
 * Query params:
 *  - team_id: Filter by team (required)
 *  - contact_id: Filter by contact
 *  - deal_id: Filter by deal
 *  - status: Filter by status (pending, in_progress, completed)
 *  - type: Filter by type (task, call, email, meeting, note)
 *  - assigned_to: Filter by assignee
 *  - limit: Pagination limit (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (IS_PRODUCTION && sql) {
      // Build dynamic query for Postgres
      let query = `
        SELECT a.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.email as contact_email
        FROM activities a
        LEFT JOIN contacts c ON a.contact_id = c.id
        WHERE a.team_id = '${teamId}'
      `;

      if (contactId) query += ` AND a.contact_id = '${contactId}'`;
      if (dealId) query += ` AND a.deal_id = '${dealId}'`;
      if (status) query += ` AND a.status = '${status}'`;
      if (type) query += ` AND a.type = '${type}'`;
      if (assignedTo) query += ` AND a.assigned_to = '${assignedTo}'`;

      query += ` ORDER BY CASE WHEN a.status = 'pending' THEN 0 WHEN a.status = 'in_progress' THEN 1 ELSE 2 END, a.due_date ASC NULLS LAST, a.created_at DESC LIMIT ${limit}`;

      const activities = await sql.unsafe(query);
      return NextResponse.json({ activities });
    } else {
      const db = getSqliteDb();

      // Build dynamic query for SQLite
      let query = `
        SELECT a.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.email as contact_email
        FROM activities a
        LEFT JOIN contacts c ON a.contact_id = c.id
        WHERE a.team_id = ?
      `;
      const params: any[] = [teamId];

      if (contactId) {
        query += ` AND a.contact_id = ?`;
        params.push(contactId);
      }
      if (dealId) {
        query += ` AND a.deal_id = ?`;
        params.push(dealId);
      }
      if (status) {
        query += ` AND a.status = ?`;
        params.push(status);
      }
      if (type) {
        query += ` AND a.type = ?`;
        params.push(type);
      }
      if (assignedTo) {
        query += ` AND a.assigned_to = ?`;
        params.push(assignedTo);
      }

      query += ` ORDER BY CASE WHEN a.status = 'pending' THEN 0 WHEN a.status = 'in_progress' THEN 1 ELSE 2 END, a.due_date ASC, a.created_at DESC LIMIT ?`;
      params.push(limit);

      const activities = db.prepare(query).all(...params);
      return NextResponse.json({ activities });
    }

  } catch (error: any) {
    console.error('❌ GET /api/activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Body: { team_id, type, title, description?, contact_id?, deal_id?, lead_id?, assigned_to?, due_date?, priority? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.type || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, type, title' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['task', 'call', 'email', 'meeting', 'note'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    if (IS_PRODUCTION && sql) {
      const result = await sql`
        INSERT INTO activities (
          id, team_id, type, title, description, contact_id, deal_id, lead_id,
          assigned_to, due_date, priority, status, metadata, created_by, created_at, updated_at
        )
        VALUES (
          ${id}, ${body.team_id}, ${body.type}, ${body.title}, ${body.description || null},
          ${body.contact_id || null}, ${body.deal_id || null}, ${body.lead_id || null},
          ${body.assigned_to || null}, ${body.due_date || null}, ${body.priority || 'medium'},
          'pending', ${JSON.stringify(body.metadata || {})}, ${body.created_by || null}, ${now}, ${now}
        )
        RETURNING *
      `;

      console.log('✅ Activity created via API:', id);
      return NextResponse.json({ success: true, activity: result[0] });

    } else {
      const db = getSqliteDb();

      db.prepare(`
        INSERT INTO activities (
          id, team_id, type, title, description, contact_id, deal_id, lead_id,
          assigned_to, due_date, priority, status, metadata, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
      `).run(
        id, body.team_id, body.type, body.title, body.description || null,
        body.contact_id || null, body.deal_id || null, body.lead_id || null,
        body.assigned_to || null, body.due_date || null, body.priority || 'medium',
        JSON.stringify(body.metadata || {}), body.created_by || null, now.toISOString(), now.toISOString()
      );

      const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);

      console.log('✅ Activity created via API:', id);
      return NextResponse.json({ success: true, activity });
    }

  } catch (error: any) {
    console.error('❌ POST /api/activities error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity', details: error.message },
      { status: 500 }
    );
  }
}
