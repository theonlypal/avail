/**
 * Activities API Route (by ID) - PRODUCTION READY
 *
 * GET: Get activity by ID
 * PUT: Update activity (complete, reschedule, etc.)
 * DELETE: Delete activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

async function getActivityById(id: string) {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM activities WHERE id = $1', [id]);
    return result.rows[0] || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM activities WHERE id = ?').get(id) || null;
  }
}

/**
 * GET /api/activities/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await getActivityById(id);

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity });

  } catch (error: any) {
    console.error('❌ GET /api/activities/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/activities/[id]
 * Body: Any activity fields to update
 * Common uses: Complete task, update due date, change priority
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date();

    // Build update query dynamically based on provided fields
    const allowedFields = ['type', 'title', 'description', 'contact_id', 'deal_id', 'lead_id',
      'assigned_to', 'due_date', 'priority', 'status', 'outcome', 'duration_minutes', 'completed_at'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Auto-set completed_at when completing
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = now.toISOString();
      }
    }

    // Validate priority if provided
    if (updates.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(updates.priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    updates.updated_at = now;

    if (IS_PRODUCTION && pgPool) {
      // Build SET clause for Postgres with parameterized values
      const keys = Object.keys(updates);
      const values = keys.map(key => {
        const val = updates[key];
        if (val instanceof Date) return val.toISOString();
        return val;
      });
      values.push(id);

      const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
      const result = await pgPool.query(
        `UPDATE activities SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.log('✅ Activity updated via API:', id);
      return NextResponse.json({ success: true, activity: result.rows[0] });

    } else {
      const db = getSqliteDb();

      const query = `UPDATE activities SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (v instanceof Date) return v.toISOString();
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.log('✅ Activity updated via API:', id);

      const updatedActivity = await getActivityById(id);
      return NextResponse.json({ success: true, activity: updatedActivity });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/activities/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update activity', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activities/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query('DELETE FROM activities WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.log('✅ Activity deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM activities WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.log('✅ Activity deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/activities/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity', details: error.message },
      { status: 500 }
    );
  }
}
