/**
 * Communications API Route (by ID) - PRODUCTION READY
 *
 * GET: Get communication by ID
 * PUT: Update communication
 * DELETE: Delete communication
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

function getSqliteDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

async function getCommunicationById(id: string) {
  if (IS_PRODUCTION && sql) {
    const result = await sql`SELECT * FROM communications WHERE id = ${id}`;
    return result[0] || null;
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

    if (IS_PRODUCTION && sql) {
      const setClause = Object.keys(updates).map(key => {
        const val = updates[key];
        if (val === null) return `${key} = NULL`;
        return `${key} = '${val}'`;
      }).join(', ');

      const result = await sql`UPDATE communications SET ${sql.unsafe(setClause)} WHERE id = ${id} RETURNING *`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      console.log('✅ Communication updated via API:', id);
      return NextResponse.json({ success: true, communication: result[0] });

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

    if (IS_PRODUCTION && sql) {
      const result = await sql`DELETE FROM communications WHERE id = ${id} RETURNING id`;

      if (result.length === 0) {
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
