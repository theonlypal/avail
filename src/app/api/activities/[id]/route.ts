/**
 * Activities API Route (by ID) - PRODUCTION READY
 *
 * GET: Get activity by ID
 * PUT: Update activity (complete, reschedule, etc.)
 * DELETE: Delete activity
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

async function getActivityById(id: string) {
  if (IS_PRODUCTION && sql) {
    const result = await sql`SELECT * FROM activities WHERE id = ${id}`;
    return result[0] || null;
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

    if (IS_PRODUCTION && sql) {
      // Build SET clause for Postgres
      const setClause = Object.keys(updates).map(key => {
        const val = updates[key];
        if (val === null) return `${key} = NULL`;
        return `${key} = '${val}'`;
      }).join(', ');

      const result = await sql`UPDATE activities SET ${sql.unsafe(setClause)} WHERE id = ${id} RETURNING *`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.log('✅ Activity updated via API:', id);
      return NextResponse.json({ success: true, activity: result[0] });

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

    if (IS_PRODUCTION && sql) {
      const result = await sql`DELETE FROM activities WHERE id = ${id} RETURNING id`;

      if (result.length === 0) {
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
