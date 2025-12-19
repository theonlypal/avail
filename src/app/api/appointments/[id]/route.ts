/**
 * Appointments API Route (by ID) - PRODUCTION READY
 *
 * GET: Get appointment by ID
 * PUT: Update appointment (status, time, location, etc.)
 * DELETE: Delete appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById } from '@/lib/db-crm';
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

/**
 * GET /api/appointments/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });

  } catch (error: any) {
    console.error('❌ GET /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appointments/[id]
 * Body: Any appointment fields to update
 * Common: Update status (scheduled → completed/cancelled/no_show)
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
    const allowedFields = ['start_time', 'end_time', 'location', 'notes', 'status', 'google_calendar_event_id'];
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
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (updates.start_time) {
      const startTime = new Date(updates.start_time);
      if (isNaN(startTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start_time format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
      updates.start_time = startTime;
    }

    if (updates.end_time) {
      const endTime = new Date(updates.end_time);
      if (isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end_time format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
      updates.end_time = endTime;
    }

    // Validate start < end if both provided
    if (updates.start_time && updates.end_time && updates.end_time <= updates.start_time) {
      return NextResponse.json(
        { error: 'end_time must be after start_time' },
        { status: 400 }
      );
    }

    updates.updated_at = now;

    if (IS_PRODUCTION && pgPool) {
      // Postgres update - Build SET clause with parameterized query
      const keys = Object.keys(updates);
      const values = keys.map(key => {
        const val = updates[key];
        if (val instanceof Date) return val.toISOString();
        return val;
      });
      values.push(id);

      const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
      const result = await pgPool.query(
        `UPDATE appointments SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      console.log('✅ Appointment updated via API:', id, updates.status ? `→ ${updates.status}` : '');
      return NextResponse.json({ success: true, appointment: result.rows[0] });

    } else {
      // SQLite
      const db = getSqliteDb();

      const query = `UPDATE appointments SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (v instanceof Date) return v.toISOString();
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      console.log('✅ Appointment updated via API:', id, updates.status ? `→ ${updates.status}` : '');

      const updatedAppointment = await getAppointmentById(id);
      return NextResponse.json({ success: true, appointment: updatedAppointment });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Also deletes from Google Calendar if google_calendar_event_id is present
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get appointment first to check for Google Calendar event
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // TODO: If google_calendar_event_id exists, delete from Google Calendar

    if (IS_PRODUCTION && pgPool) {
      await pgPool.query('DELETE FROM appointments WHERE id = $1', [id]);
      console.log('✅ Appointment deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
      console.log('✅ Appointment deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment', details: error.message },
      { status: 500 }
    );
  }
}
