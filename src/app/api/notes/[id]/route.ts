/**
 * Notes API Route (by ID) - PRODUCTION READY
 *
 * GET: Get note by ID
 * PUT: Update note
 * DELETE: Delete note
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

async function getNoteById(id: string) {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM notes WHERE id = $1', [id]);
    return result.rows[0] || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) || null;
  }
}

/**
 * GET /api/notes/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await getNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });

  } catch (error: any) {
    console.error('❌ GET /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notes/[id]
 * Body: { content?, is_pinned? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date();

    const allowedFields = ['content', 'is_pinned'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = field === 'is_pinned' ? (body[field] ? 1 : 0) : body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = now;

    if (IS_PRODUCTION && pgPool) {
      const keys = Object.keys(updates);
      const values = keys.map(key => {
        const val = updates[key];
        if (val instanceof Date) return val.toISOString();
        return val;
      });
      values.push(id);

      const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
      const result = await pgPool.query(
        `UPDATE notes SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      console.log('✅ Note updated via API:', id);
      return NextResponse.json({ success: true, note: result.rows[0] });

    } else {
      const db = getSqliteDb();

      const query = `UPDATE notes SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (v instanceof Date) return v.toISOString();
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      console.log('✅ Note updated via API:', id);

      const updatedNote = await getNoteById(id);
      return NextResponse.json({ success: true, note: updatedNote });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update note', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      console.log('✅ Note deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      console.log('✅ Note deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note', details: error.message },
      { status: 500 }
    );
  }
}
