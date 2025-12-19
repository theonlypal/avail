/**
 * Messages API - PRODUCTION READY
 *
 * GET /api/messages - List all messages (with optional filters)
 * POST /api/messages - Create new message
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
  });
}
const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb() {
  return new Database(DB_PATH);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const channel = searchParams.get('channel'); // 'sms' or 'email'
    const direction = searchParams.get('direction'); // 'inbound' or 'outbound'
    const limit = parseInt(searchParams.get('limit') || '50');

    if (IS_PRODUCTION && pgPool) {
      let query = 'SELECT * FROM messages WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (contactId) {
        query += ` AND contact_id = $${paramIndex++}`;
        params.push(contactId);
      }
      if (channel) {
        query += ` AND channel = $${paramIndex++}`;
        params.push(channel);
      }
      if (direction) {
        query += ` AND direction = $${paramIndex++}`;
        params.push(direction);
      }

      query += ` ORDER BY sent_at DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await pgPool.query(query, params);

      return NextResponse.json({
        success: true,
        messages: result.rows,
      });
    } else {
      // SQLite query
      const db = getSqliteDb();
      let query = 'SELECT * FROM messages WHERE 1=1';
      const params: any[] = [];

      if (contactId) {
        query += ' AND contact_id = ?';
        params.push(contactId);
      }
      if (channel) {
        query += ' AND channel = ?';
        params.push(channel);
      }
      if (direction) {
        query += ' AND direction = ?';
        params.push(direction);
      }

      query += ' ORDER BY sent_at DESC LIMIT ?';
      params.push(limit);

      const messages = db.prepare(query).all(...params);

      return NextResponse.json({
        success: true,
        messages,
      });
    }
  } catch (error: any) {
    console.error('❌ GET /api/messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.direction || !data.channel || !data.body) {
      return NextResponse.json(
        { error: 'Missing required fields: direction, channel, body' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const sentAt = data.sent_at ? new Date(data.sent_at) : now;

    if (IS_PRODUCTION && pgPool) {
      const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;
      const result = await pgPool.query(
        `INSERT INTO messages (id, contact_id, direction, channel, from_number, to_number, body, status, twilio_sid, postmark_message_id, metadata, sent_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [id, data.contact_id, data.direction, data.channel, data.from_number, data.to_number, data.body, data.status || 'sent', data.twilio_sid, data.postmark_message_id, metadataJson, sentAt, now]
      );

      return NextResponse.json({
        success: true,
        message: result.rows[0],
      });
    } else {
      const db = getSqliteDb();
      const metadataString = data.metadata ? JSON.stringify(data.metadata) : null;
      db.prepare(`
        INSERT INTO messages (id, contact_id, direction, channel, from_number, to_number, body, status, twilio_sid, postmark_message_id, metadata, sent_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.contact_id || null,
        data.direction,
        data.channel,
        data.from_number || null,
        data.to_number || null,
        data.body,
        data.status || 'sent',
        data.twilio_sid || null,
        data.postmark_message_id || null,
        metadataString,
        sentAt.toISOString(),
        now.toISOString()
      );

      return NextResponse.json({
        success: true,
        message: {
          id,
          ...data,
          sent_at: sentAt,
          created_at: now,
        },
      });
    }
  } catch (error: any) {
    console.error('❌ POST /api/messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
