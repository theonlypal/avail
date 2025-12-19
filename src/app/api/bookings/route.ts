/**
 * Bookings API Route - PRODUCTION READY
 *
 * GET: List bookings
 * POST: Create a new booking (from Calendly webhook or manual)
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

  // Ensure bookings table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      contact_id TEXT,
      lead_id TEXT,
      external_id TEXT,
      title TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      attendee_email TEXT,
      attendee_name TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

/**
 * GET /api/bookings
 * Query params:
 *  - team_id: Filter by team
 *  - status: Filter by status (scheduled, completed, cancelled, no_show)
 *  - upcoming: If 'true', only show future bookings
 *  - limit: Pagination limit (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (IS_PRODUCTION && sql) {
      let query = `
        SELECT * FROM bookings
        WHERE team_id = '${teamId}'
      `;

      if (status) query += ` AND status = '${status}'`;
      if (upcoming) query += ` AND start_time > NOW()`;

      query += ` ORDER BY start_time ASC LIMIT ${limit}`;

      const result = await sql.unsafe(query);
      const bookings = Array.isArray(result) ? result : [];
      return NextResponse.json({ bookings });
    } else {
      const db = getSqliteDb();

      let query = `
        SELECT * FROM bookings
        WHERE team_id = ?
      `;
      const params: any[] = [teamId];

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      if (upcoming) {
        query += ` AND start_time > datetime('now')`;
      }

      query += ` ORDER BY start_time ASC LIMIT ?`;
      params.push(limit);

      const bookings = db.prepare(query).all(...params);
      return NextResponse.json({ bookings });
    }

  } catch (error: any) {
    console.error('❌ GET /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Body: { team_id, title, start_time, end_time?, attendee_email?, attendee_name?, contact_id?, lead_id?, external_id?, status?, notes?, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.title || !body.start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, title, start_time' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    if (IS_PRODUCTION && sql) {
      const result = await sql`
        INSERT INTO bookings (
          id, team_id, contact_id, lead_id, external_id, title,
          start_time, end_time, attendee_email, attendee_name,
          status, notes, metadata, created_at
        )
        VALUES (
          ${id}, ${body.team_id}, ${body.contact_id || null}, ${body.lead_id || null},
          ${body.external_id || null}, ${body.title},
          ${body.start_time}, ${body.end_time || null},
          ${body.attendee_email || null}, ${body.attendee_name || null},
          ${body.status || 'scheduled'}, ${body.notes || null},
          ${JSON.stringify(body.metadata || {})}, ${now}
        )
        RETURNING *
      `;

      console.log('✅ Booking created via API:', id);
      return NextResponse.json({ success: true, booking: result[0] });

    } else {
      const db = getSqliteDb();

      db.prepare(`
        INSERT INTO bookings (
          id, team_id, contact_id, lead_id, external_id, title,
          start_time, end_time, attendee_email, attendee_name,
          status, notes, metadata, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.team_id, body.contact_id || null, body.lead_id || null,
        body.external_id || null, body.title,
        body.start_time, body.end_time || null,
        body.attendee_email || null, body.attendee_name || null,
        body.status || 'scheduled', body.notes || null,
        JSON.stringify(body.metadata || {}), now.toISOString()
      );

      const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

      console.log('✅ Booking created via API:', id);
      return NextResponse.json({ success: true, booking });
    }

  } catch (error: any) {
    console.error('❌ POST /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    );
  }
}
