/**
 * Communications API Route - PRODUCTION READY
 *
 * GET: List communications (with optional filtering)
 * POST: Log a new communication (call, email, SMS)
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

  // Ensure communications table exists
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
      status TEXT DEFAULT 'sent',
      external_id TEXT,
      duration_seconds INTEGER,
      outcome TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

/**
 * GET /api/communications
 * Query params:
 *  - team_id: Filter by team (required)
 *  - contact_id: Filter by contact
 *  - deal_id: Filter by deal
 *  - type: Filter by type (sms, email, call)
 *  - direction: Filter by direction (inbound, outbound)
 *  - limit: Pagination limit (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const type = searchParams.get('type');
    const direction = searchParams.get('direction');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (IS_PRODUCTION && pgPool) {
      // Build parameterized query for Postgres
      const conditions: string[] = ['com.team_id = $1'];
      const params: any[] = [teamId];
      let paramIndex = 2;

      if (contactId) {
        conditions.push(`com.contact_id = $${paramIndex}`);
        params.push(contactId);
        paramIndex++;
      }
      if (dealId) {
        conditions.push(`com.deal_id = $${paramIndex}`);
        params.push(dealId);
        paramIndex++;
      }
      if (type) {
        conditions.push(`com.type = $${paramIndex}`);
        params.push(type);
        paramIndex++;
      }
      if (direction) {
        conditions.push(`com.direction = $${paramIndex}`);
        params.push(direction);
        paramIndex++;
      }

      params.push(limit);
      const query = `
        SELECT com.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.email as contact_email,
          c.phone as contact_phone
        FROM communications com
        LEFT JOIN contacts c ON com.contact_id = c.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY com.created_at DESC LIMIT $${paramIndex}
      `;

      const result = await pgPool.query(query, params);
      return NextResponse.json({ communications: result.rows });
    } else {
      const db = getSqliteDb();

      // Build dynamic query for SQLite
      let query = `
        SELECT com.*,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.email as contact_email,
          c.phone as contact_phone
        FROM communications com
        LEFT JOIN contacts c ON com.contact_id = c.id
        WHERE com.team_id = ?
      `;
      const params: any[] = [teamId];

      if (contactId) {
        query += ` AND com.contact_id = ?`;
        params.push(contactId);
      }
      if (dealId) {
        query += ` AND com.deal_id = ?`;
        params.push(dealId);
      }
      if (type) {
        query += ` AND com.type = ?`;
        params.push(type);
      }
      if (direction) {
        query += ` AND com.direction = ?`;
        params.push(direction);
      }

      query += ` ORDER BY com.created_at DESC LIMIT ?`;
      params.push(limit);

      const communications = db.prepare(query).all(...params);
      return NextResponse.json({ communications });
    }

  } catch (error: any) {
    console.error('❌ GET /api/communications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communications
 * Body: { team_id, type, direction, contact_id?, deal_id?, lead_id?, from_address?, to_address?, subject?, body, status?, duration_seconds?, outcome?, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.type || !body.direction) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, type, direction' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['sms', 'email', 'call'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate direction
    const validDirections = ['inbound', 'outbound'];
    if (!validDirections.includes(body.direction)) {
      return NextResponse.json(
        { error: `Invalid direction. Must be one of: ${validDirections.join(', ')}` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(`
        INSERT INTO communications (
          id, team_id, type, direction, contact_id, deal_id, lead_id,
          from_address, to_address, subject, body, status, external_id,
          duration_seconds, outcome, metadata, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        id, body.team_id, body.type, body.direction,
        body.contact_id || null, body.deal_id || null, body.lead_id || null,
        body.from_address || null, body.to_address || null, body.subject || null,
        body.body || null, body.status || 'sent', body.external_id || null,
        body.duration_seconds || null, body.outcome || null,
        JSON.stringify(body.metadata || {}), now
      ]);

      console.log('✅ Communication logged via API:', id);
      return NextResponse.json({ success: true, communication: result.rows[0] });

    } else {
      const db = getSqliteDb();

      db.prepare(`
        INSERT INTO communications (
          id, team_id, type, direction, contact_id, deal_id, lead_id,
          from_address, to_address, subject, body, status, external_id,
          duration_seconds, outcome, metadata, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.team_id, body.type, body.direction,
        body.contact_id || null, body.deal_id || null, body.lead_id || null,
        body.from_address || null, body.to_address || null, body.subject || null,
        body.body || null, body.status || 'sent', body.external_id || null,
        body.duration_seconds || null, body.outcome || null,
        JSON.stringify(body.metadata || {}), now.toISOString()
      );

      const communication = db.prepare('SELECT * FROM communications WHERE id = ?').get(id);

      console.log('✅ Communication logged via API:', id);
      return NextResponse.json({ success: true, communication });
    }

  } catch (error: any) {
    console.error('❌ POST /api/communications error:', error);
    return NextResponse.json(
      { error: 'Failed to log communication', details: error.message },
      { status: 500 }
    );
  }
}
