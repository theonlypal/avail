/**
 * Dialer Queue API
 *
 * Manages the queue of leads to be called by the power dialer.
 * Supports adding leads from Leadly AI search and getting the next lead to call.
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
const DATA_DIR = path.join(process.cwd(), 'data');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

if (!IS_PRODUCTION && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

function getDb(): any {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS dialer_queue (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      business_type TEXT,
      score INTEGER,
      priority INTEGER DEFAULT 5,
      status TEXT DEFAULT 'pending',
      attempt_count INTEGER DEFAULT 0,
      last_attempt_at DATETIME,
      outcome TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_dialer_queue_status ON dialer_queue(status)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_dialer_queue_priority ON dialer_queue(priority DESC, created_at ASC)
  `);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    const database = getDb();

    let query = 'SELECT * FROM dialer_queue';
    const params: (string | number)[] = [];

    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY priority DESC, created_at ASC LIMIT ?';
    params.push(limit);

    const items = database.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      queue: items,
      count: items.length,
    });
  } catch (error) {
    console.error('Failed to get dialer queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No leads provided' },
        { status: 400 }
      );
    }

    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO dialer_queue (id, lead_id, name, phone, business_type, score, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const insertMany = database.transaction((items: typeof leads) => {
      for (const lead of items) {
        stmt.run(
          uuidv4(),
          lead.lead_id,
          lead.name,
          lead.phone,
          lead.business_type || null,
          lead.score || null,
          lead.priority || 5
        );
      }
    });

    insertMany(leads);

    return NextResponse.json({
      success: true,
      message: `Added ${leads.length} leads to dialer queue`,
      count: leads.length,
    });
  } catch (error) {
    console.error('Failed to add to dialer queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to queue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearCompleted = searchParams.get('clearCompleted') === 'true';

    const database = getDb();

    if (clearCompleted) {
      database.prepare("DELETE FROM dialer_queue WHERE status = 'completed'").run();
      return NextResponse.json({
        success: true,
        message: 'Cleared completed items',
      });
    }

    if (id) {
      database.prepare('DELETE FROM dialer_queue WHERE id = ?').run(id);
      return NextResponse.json({
        success: true,
        message: 'Item removed from queue',
      });
    }

    return NextResponse.json(
      { success: false, error: 'No id or clearCompleted provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to delete from queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, outcome, notes, attempt_count } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'No id provided' },
        { status: 400 }
      );
    }

    const database = getDb();

    const updates: string[] = ['updated_at = datetime("now")'];
    const params: (string | number | null)[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (outcome) {
      updates.push('outcome = ?');
      params.push(outcome);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (attempt_count !== undefined) {
      updates.push('attempt_count = ?');
      params.push(attempt_count);
      updates.push('last_attempt_at = datetime("now")');
    }

    params.push(id);

    database.prepare(
      `UPDATE dialer_queue SET ${updates.join(', ')} WHERE id = ?`
    ).run(...params);

    return NextResponse.json({
      success: true,
      message: 'Queue item updated',
    });
  } catch (error) {
    console.error('Failed to update queue item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update' },
      { status: 500 }
    );
  }
}
