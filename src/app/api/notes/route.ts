/**
 * Notes API Route - PRODUCTION READY
 *
 * GET: List notes (with optional filtering by contact/deal/lead)
 * POST: Create new note
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Ensure notes table exists
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

  return db;
}

/**
 * GET /api/notes
 * Query params:
 *  - team_id: Filter by team (required)
 *  - contact_id: Filter by contact
 *  - deal_id: Filter by deal
 *  - lead_id: Filter by lead
 *  - limit: Pagination limit (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const leadId = searchParams.get('lead_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (IS_PRODUCTION && pgPool) {
      const conditions: string[] = ['n.team_id = $1'];
      const params: any[] = [teamId];
      let paramIndex = 2;

      if (contactId) {
        conditions.push(`n.contact_id = $${paramIndex}`);
        params.push(contactId);
        paramIndex++;
      }
      if (dealId) {
        conditions.push(`n.deal_id = $${paramIndex}`);
        params.push(dealId);
        paramIndex++;
      }
      if (leadId) {
        conditions.push(`n.lead_id = $${paramIndex}`);
        params.push(leadId);
        paramIndex++;
      }

      params.push(limit);
      const query = `
        SELECT n.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name
        FROM notes n
        LEFT JOIN contacts c ON n.contact_id = c.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY n.is_pinned DESC, n.created_at DESC LIMIT $${paramIndex}
      `;

      const result = await pgPool.query(query, params);
      return NextResponse.json({ notes: result.rows });
    } else {
      const db = getSqliteDb();

      let query = `
        SELECT n.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name
        FROM notes n
        LEFT JOIN contacts c ON n.contact_id = c.id
        WHERE n.team_id = ?
      `;
      const params: any[] = [teamId];

      if (contactId) {
        query += ` AND n.contact_id = ?`;
        params.push(contactId);
      }
      if (dealId) {
        query += ` AND n.deal_id = ?`;
        params.push(dealId);
      }
      if (leadId) {
        query += ` AND n.lead_id = ?`;
        params.push(leadId);
      }

      query += ` ORDER BY n.is_pinned DESC, n.created_at DESC LIMIT ?`;
      params.push(limit);

      const notes = db.prepare(query).all(...params);
      return NextResponse.json({ notes });
    }

  } catch (error: any) {
    console.error('❌ GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Body: { team_id, content, contact_id?, deal_id?, lead_id?, is_pinned? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, content' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(`
        INSERT INTO notes (
          id, team_id, content, contact_id, deal_id, lead_id, is_pinned, created_by, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        id, body.team_id, body.content, body.contact_id || null,
        body.deal_id || null, body.lead_id || null, body.is_pinned ? 1 : 0,
        body.created_by || null, now, now
      ]);

      console.log('✅ Note created via API:', id);
      return NextResponse.json({ success: true, note: result.rows[0] });

    } else {
      const db = getSqliteDb();

      db.prepare(`
        INSERT INTO notes (
          id, team_id, content, contact_id, deal_id, lead_id, is_pinned, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.team_id, body.content, body.contact_id || null,
        body.deal_id || null, body.lead_id || null, body.is_pinned ? 1 : 0,
        body.created_by || null, now.toISOString(), now.toISOString()
      );

      const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

      console.log('✅ Note created via API:', id);
      return NextResponse.json({ success: true, note });
    }

  } catch (error: any) {
    console.error('❌ POST /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    );
  }
}
