/**
 * Tasks API Route (by ID) - PRODUCTION READY
 *
 * GET: Get task by ID
 * PUT: Update task (status, assignee, priority, etc.)
 * DELETE: Delete task
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

function getSqliteDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

async function getTaskById(id: string) {
  if (IS_PRODUCTION && sql) {
    const result = await sql`
      SELECT
        t.*,
        jsonb_build_object(
          'id', tm.id,
          'name', tm.name,
          'email', tm.email
        ) as assignee
      FROM tasks t
      LEFT JOIN team_members tm ON t.assignee_id = tm.id
      WHERE t.id = ${id}
    `;
    return result[0] || null;
  } else {
    const db = getSqliteDb();
    const task = db.prepare(`
      SELECT
        t.*,
        tm.name as assignee_name,
        tm.email as assignee_email
      FROM tasks t
      LEFT JOIN team_members tm ON t.assignee_id = tm.id
      WHERE t.id = ?
    `).get(id);

    if (!task) return null;

    // Transform to match Postgres format
    return {
      ...(task as any),
      tags: (task as any).tags ? JSON.parse((task as any).tags) : [],
      assignee: (task as any).assignee_id ? {
        id: (task as any).assignee_id,
        name: (task as any).assignee_name,
        email: (task as any).assignee_email,
      } : null,
    };
  }
}

/**
 * GET /api/tasks/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await getTaskById(id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });

  } catch (error: any) {
    console.error('❌ GET /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Body: Any task fields to update
 * Common: Update status (todo → in_progress → completed)
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
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'due_date',
      'assignee_id', 'related_to_type', 'related_to_id',
      'parent_task_id', 'estimated_hours', 'actual_hours', 'tags'
    ];
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
      const validStatuses = ['todo', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Auto-set completed_at when status changes to completed
      if (updates.status === 'completed') {
        updates.completed_at = now;
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

    // Validate due_date if provided
    if (updates.due_date) {
      const dueDate = new Date(updates.due_date);
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid due_date format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
      updates.due_date = dueDate;
    }

    updates.updated_at = now;

    if (IS_PRODUCTION && sql) {
      // Postgres update - Build SET clause
      const setClause = Object.keys(updates)
        .map(key => {
          const value = updates[key];
          if (value === null) return `${key} = NULL`;
          if (value instanceof Date) return `${key} = '${value.toISOString()}'`;
          if (Array.isArray(value)) return `${key} = '${JSON.stringify(value)}'`;
          if (typeof value === 'string') return `${key} = '${value.replace(/'/g, "''")}'`;
          return `${key} = '${value}'`;
        })
        .join(', ');

      const result = await sql.unsafe(
        `UPDATE tasks SET ${setClause} WHERE id = '${id}' RETURNING *`
      ) as unknown as any[];

      if (!result || result.length === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      console.log('✅ Task updated via API:', id, updates.status ? `→ ${updates.status}` : '');
      return NextResponse.json({ success: true, task: result[0] });

    } else {
      // SQLite
      const db = getSqliteDb();

      const query = `UPDATE tasks SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (v instanceof Date) return v.toISOString();
        if (Array.isArray(v)) return JSON.stringify(v);
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      console.log('✅ Task updated via API:', id, updates.status ? `→ ${updates.status}` : '');

      const updatedTask = await getTaskById(id);
      return NextResponse.json({ success: true, task: updatedTask });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && sql) {
      const result = await sql`DELETE FROM tasks WHERE id = ${id} RETURNING id`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      console.log('✅ Task deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      console.log('✅ Task deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task', details: error.message },
      { status: 500 }
    );
  }
}
