/**
 * Communications API Route (by ID) - PRODUCTION READY
 *
 * GET: Get communication by ID
 * PUT: Update communication
 * DELETE: Delete communication
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

async function getCommunicationById(id: string) {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM communications WHERE id = $1', [id]);
    return result.rows[0] || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM communications WHERE id = ?').get(id) || null;
  }
}

/**
 * GET /api/communications/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const communication = await getCommunicationById(id);

    if (!communication) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ communication });

  } catch (error: any) {
    console.error('❌ GET /api/communications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communications/[id]
 * Body: Any communication fields to update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update query dynamically
    const allowedFields = ['subject', 'body', 'status', 'duration_seconds', 'outcome', 'metadata'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = field === 'metadata' ? JSON.stringify(body[field]) : body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    if (IS_PRODUCTION && pgPool) {
      const keys = Object.keys(updates);
      const values = [...Object.values(updates), id];
      const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');

      const result = await pgPool.query(
        `UPDATE communications SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      console.log('✅ Communication updated via API:', id);
      return NextResponse.json({ success: true, communication: result.rows[0] });

    } else {
      const db = getSqliteDb();

      const query = `UPDATE communications SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const values = [...Object.values(updates), id];

      const result = db.prepare(query).run(...values);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      console.log('✅ Communication updated via API:', id);

      const updatedCommunication = await getCommunicationById(id);
      return NextResponse.json({ success: true, communication: updatedCommunication });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/communications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update communication', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communications/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query('DELETE FROM communications WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      console.log('✅ Communication deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM communications WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      console.log('✅ Communication deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/communications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete communication', details: error.message },
      { status: 500 }
    );
  }
}
