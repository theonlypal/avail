/**
 * Tasks API Route - PRODUCTION READY
 *
 * Real CRUD operations for tasks with Neon Postgres
 * GET: List all tasks (with optional filtering)
 * POST: Create new task
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

/**
 * GET /api/tasks
 * Query params:
 *  - status: filter by status (todo, in_progress, completed, cancelled)
 *  - priority: filter by priority (low, medium, high, urgent)
 *  - assignee_id: filter by assignee
 *  - due_before: filter tasks due before date (ISO string)
 *  - related_to_type: filter by related entity type (lead, deal, contact)
 *  - related_to_id: filter by related entity ID
 *  - limit: pagination limit (default 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee_id = searchParams.get('assignee_id');
    const due_before = searchParams.get('due_before');
    const related_to_type = searchParams.get('related_to_type');
    const related_to_id = searchParams.get('related_to_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (IS_PRODUCTION && sql) {
      // Build Postgres query with filters
      let query = `
        SELECT
          t.*,
          jsonb_build_object(
            'id', tm.id,
            'name', tm.name,
            'email', tm.email
          ) as assignee
        FROM tasks t
        LEFT JOIN team_members tm ON t.assignee_id = tm.id
        WHERE 1=1
      `;
      const conditions: string[] = [];

      if (status) conditions.push(`t.status = '${status}'`);
      if (priority) conditions.push(`t.priority = '${priority}'`);
      if (assignee_id) conditions.push(`t.assignee_id = '${assignee_id}'`);
      if (due_before) conditions.push(`t.due_date < '${due_before}'`);
      if (related_to_type) conditions.push(`t.related_to_type = '${related_to_type}'`);
      if (related_to_id) conditions.push(`t.related_to_id = '${related_to_id}'`);

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ` ORDER BY
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC,
        t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const tasks = await sql.unsafe(query);
      return NextResponse.json({ tasks });

    } else {
      // SQLite with JOIN
      const db = getSqliteDb();
      let query = `
        SELECT
          t.id,
          t.team_id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.completed_at,
          t.assignee_id,
          t.created_by,
          t.related_to_type,
          t.related_to_id,
          t.parent_task_id,
          t.estimated_hours,
          t.actual_hours,
          t.tags,
          t.created_at,
          t.updated_at,
          tm.name as assignee_name,
          tm.email as assignee_email
        FROM tasks t
        LEFT JOIN team_members tm ON t.assignee_id = tm.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }
      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }
      if (assignee_id) {
        query += ' AND t.assignee_id = ?';
        params.push(assignee_id);
      }
      if (due_before) {
        query += ' AND t.due_date < ?';
        params.push(due_before);
      }
      if (related_to_type) {
        query += ' AND t.related_to_type = ?';
        params.push(related_to_type);
      }
      if (related_to_id) {
        query += ' AND t.related_to_id = ?';
        params.push(related_to_id);
      }

      query += ` ORDER BY
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC,
        t.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      const rawTasks = db.prepare(query).all(...params);

      // Transform SQLite results to match expected format
      const tasks = rawTasks.map((row: any) => ({
        id: row.id,
        team_id: row.team_id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        due_date: row.due_date,
        completed_at: row.completed_at,
        assignee_id: row.assignee_id,
        created_by: row.created_by,
        related_to_type: row.related_to_type,
        related_to_id: row.related_to_id,
        parent_task_id: row.parent_task_id,
        estimated_hours: row.estimated_hours,
        actual_hours: row.actual_hours,
        tags: row.tags ? JSON.parse(row.tags) : [],
        created_at: row.created_at,
        updated_at: row.updated_at,
        assignee: row.assignee_id ? {
          id: row.assignee_id,
          name: row.assignee_name,
          email: row.assignee_email,
        } : null,
      }));

      return NextResponse.json({ tasks });
    }

  } catch (error: any) {
    console.error('❌ GET /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Body: {
 *   team_id,
 *   title,
 *   description?,
 *   status?,
 *   priority?,
 *   due_date?,
 *   assignee_id?,
 *   created_by?,
 *   related_to_type?,
 *   related_to_id?,
 *   parent_task_id?,
 *   estimated_hours?,
 *   tags?
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, title' },
        { status: 400 }
      );
    }

    // Validate status
    if (body.status) {
      const validStatuses = ['todo', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate priority
    if (body.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const taskData = {
      id: crypto.randomUUID(),
      team_id: body.team_id,
      title: body.title,
      description: body.description || null,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      due_date: body.due_date || null,
      completed_at: null,
      assignee_id: body.assignee_id || null,
      created_by: body.created_by || null,
      related_to_type: body.related_to_type || null,
      related_to_id: body.related_to_id || null,
      parent_task_id: body.parent_task_id || null,
      estimated_hours: body.estimated_hours || null,
      actual_hours: null,
      tags: body.tags || [],
      created_at: now,
      updated_at: now,
    };

    if (IS_PRODUCTION && sql) {
      const result = await sql`
        INSERT INTO tasks (
          id, team_id, title, description, status, priority,
          due_date, completed_at, assignee_id, created_by,
          related_to_type, related_to_id, parent_task_id,
          estimated_hours, actual_hours, tags,
          created_at, updated_at
        ) VALUES (
          ${taskData.id}, ${taskData.team_id}, ${taskData.title}, ${taskData.description},
          ${taskData.status}, ${taskData.priority}, ${taskData.due_date}, ${taskData.completed_at},
          ${taskData.assignee_id}, ${taskData.created_by}, ${taskData.related_to_type},
          ${taskData.related_to_id}, ${taskData.parent_task_id}, ${taskData.estimated_hours},
          ${taskData.actual_hours}, ${JSON.stringify(taskData.tags)},
          ${taskData.created_at.toISOString()}, ${taskData.updated_at.toISOString()}
        )
        RETURNING *
      `;

      console.log('✅ Task created via API:', result[0].id, '-', result[0].title);
      return NextResponse.json({ success: true, task: result[0] });

    } else {
      const db = getSqliteDb();

      db.prepare(`
        INSERT INTO tasks (
          id, team_id, title, description, status, priority,
          due_date, completed_at, assignee_id, created_by,
          related_to_type, related_to_id, parent_task_id,
          estimated_hours, actual_hours, tags,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        taskData.id,
        taskData.team_id,
        taskData.title,
        taskData.description,
        taskData.status,
        taskData.priority,
        taskData.due_date,
        taskData.completed_at,
        taskData.assignee_id,
        taskData.created_by,
        taskData.related_to_type,
        taskData.related_to_id,
        taskData.parent_task_id,
        taskData.estimated_hours,
        taskData.actual_hours,
        JSON.stringify(taskData.tags),
        taskData.created_at.toISOString(),
        taskData.updated_at.toISOString()
      );

      console.log('✅ Task created via API:', taskData.id, '-', taskData.title);
      return NextResponse.json({ success: true, task: taskData });
    }

  } catch (error: any) {
    console.error('❌ POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
}
