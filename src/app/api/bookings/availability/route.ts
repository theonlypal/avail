/**
 * Availability Settings API
 *
 * GET: Get availability settings for a team
 * POST: Update availability settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface AvailableHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DEFAULT_HOURS: AvailableHours = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '09:00', end: '17:00' },
  sunday: { enabled: false, start: '09:00', end: '17:00' },
};

function getSqliteDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Ensure availability_settings table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS availability_settings (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL UNIQUE,
      timezone TEXT DEFAULT 'America/Los_Angeles',
      booking_duration INTEGER DEFAULT 30,
      buffer_time INTEGER DEFAULT 15,
      advance_notice INTEGER DEFAULT 60,
      max_advance_days INTEGER DEFAULT 60,
      available_hours TEXT DEFAULT '${JSON.stringify(DEFAULT_HOURS)}',
      meeting_types TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';

    if (IS_PRODUCTION && sql) {
      // Check if settings exist
      let result = await sql`
        SELECT * FROM availability_settings WHERE team_id = ${teamId}
      `;

      if (result.length === 0) {
        // Create default settings
        const id = uuidv4();
        await sql`
          INSERT INTO availability_settings (
            id, team_id, timezone, booking_duration, buffer_time,
            advance_notice, max_advance_days, available_hours, meeting_types
          ) VALUES (
            ${id}, ${teamId}, 'America/Los_Angeles', 30, 15,
            60, 60, ${JSON.stringify(DEFAULT_HOURS)}, '[]'
          )
        `;
        result = await sql`SELECT * FROM availability_settings WHERE team_id = ${teamId}`;
      }

      const settings = result[0];
      return NextResponse.json({
        ...settings,
        available_hours: typeof settings.available_hours === 'string'
          ? JSON.parse(settings.available_hours)
          : settings.available_hours,
        meeting_types: typeof settings.meeting_types === 'string'
          ? JSON.parse(settings.meeting_types)
          : settings.meeting_types,
      });

    } else {
      const db = getSqliteDb();

      let settings = db.prepare('SELECT * FROM availability_settings WHERE team_id = ?').get(teamId) as any;

      if (!settings) {
        // Create default settings
        const id = uuidv4();
        db.prepare(`
          INSERT INTO availability_settings (
            id, team_id, timezone, booking_duration, buffer_time,
            advance_notice, max_advance_days, available_hours, meeting_types
          ) VALUES (?, ?, 'America/Los_Angeles', 30, 15, 60, 60, ?, '[]')
        `).run(id, teamId, JSON.stringify(DEFAULT_HOURS));

        settings = db.prepare('SELECT * FROM availability_settings WHERE team_id = ?').get(teamId);
      }

      return NextResponse.json({
        ...settings,
        available_hours: typeof settings.available_hours === 'string'
          ? JSON.parse(settings.available_hours)
          : settings.available_hours,
        meeting_types: typeof settings.meeting_types === 'string'
          ? JSON.parse(settings.meeting_types)
          : settings.meeting_types,
      });
    }

  } catch (error: any) {
    console.error('GET /api/bookings/availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability settings', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const teamId = body.team_id || 'default-team';

    const {
      timezone = 'America/Los_Angeles',
      booking_duration = 30,
      buffer_time = 15,
      advance_notice = 60,
      max_advance_days = 60,
      available_hours = DEFAULT_HOURS,
      meeting_types = [],
    } = body;

    if (IS_PRODUCTION && sql) {
      // Upsert availability settings
      await sql`
        INSERT INTO availability_settings (
          id, team_id, timezone, booking_duration, buffer_time,
          advance_notice, max_advance_days, available_hours, meeting_types, updated_at
        ) VALUES (
          ${uuidv4()}, ${teamId}, ${timezone}, ${booking_duration}, ${buffer_time},
          ${advance_notice}, ${max_advance_days}, ${JSON.stringify(available_hours)},
          ${JSON.stringify(meeting_types)}, NOW()
        )
        ON CONFLICT (team_id) DO UPDATE SET
          timezone = ${timezone},
          booking_duration = ${booking_duration},
          buffer_time = ${buffer_time},
          advance_notice = ${advance_notice},
          max_advance_days = ${max_advance_days},
          available_hours = ${JSON.stringify(available_hours)},
          meeting_types = ${JSON.stringify(meeting_types)},
          updated_at = NOW()
      `;

      const result = await sql`SELECT * FROM availability_settings WHERE team_id = ${teamId}`;
      const settings = result[0];

      return NextResponse.json({
        success: true,
        settings: {
          ...settings,
          available_hours: typeof settings.available_hours === 'string'
            ? JSON.parse(settings.available_hours)
            : settings.available_hours,
          meeting_types: typeof settings.meeting_types === 'string'
            ? JSON.parse(settings.meeting_types)
            : settings.meeting_types,
        },
      });

    } else {
      const db = getSqliteDb();

      // Check if settings exist
      const existing = db.prepare('SELECT id FROM availability_settings WHERE team_id = ?').get(teamId);

      if (existing) {
        db.prepare(`
          UPDATE availability_settings SET
            timezone = ?,
            booking_duration = ?,
            buffer_time = ?,
            advance_notice = ?,
            max_advance_days = ?,
            available_hours = ?,
            meeting_types = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE team_id = ?
        `).run(
          timezone,
          booking_duration,
          buffer_time,
          advance_notice,
          max_advance_days,
          JSON.stringify(available_hours),
          JSON.stringify(meeting_types),
          teamId
        );
      } else {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO availability_settings (
            id, team_id, timezone, booking_duration, buffer_time,
            advance_notice, max_advance_days, available_hours, meeting_types
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, teamId, timezone, booking_duration, buffer_time,
          advance_notice, max_advance_days,
          JSON.stringify(available_hours), JSON.stringify(meeting_types)
        );
      }

      const settings = db.prepare('SELECT * FROM availability_settings WHERE team_id = ?').get(teamId) as any;

      return NextResponse.json({
        success: true,
        settings: {
          ...settings,
          available_hours: JSON.parse(settings.available_hours),
          meeting_types: JSON.parse(settings.meeting_types),
        },
      });
    }

  } catch (error: any) {
    console.error('POST /api/bookings/availability error:', error);
    return NextResponse.json(
      { error: 'Failed to update availability settings', details: error.message },
      { status: 500 }
    );
  }
}
