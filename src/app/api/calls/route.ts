/**
 * API Route: Call management
 * GET /api/calls - Fetch calls
 * POST /api/calls - Create call record
 */

import { NextResponse } from 'next/server';
import { getDb, getDefaultTeamId } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CallRecord {
  id?: string;
  lead_id: string;
  team_id?: string;
  caller_phone?: string;
  prospect_phone?: string;
  twilio_call_sid?: string;
  status: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  outcome?: string;
  notes?: string;
  recording_url?: string;
  ai_summary?: string;
  performance_score?: number;
}

/**
 * GET /api/calls - Fetch all calls for a team
 */
export async function GET(request: Request) {
  try {
    const db = getDb();
    const teamId = getDefaultTeamId();

    // Check if calls table exists, if not create it
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='calls'
    `).get();

    if (!tableExists) {
      // Create calls table
      db.exec(`
        CREATE TABLE IF NOT EXISTS calls (
          id TEXT PRIMARY KEY,
          lead_id TEXT NOT NULL,
          team_id TEXT NOT NULL,
          caller_phone TEXT,
          prospect_phone TEXT,
          twilio_call_sid TEXT,
          status TEXT NOT NULL,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          duration INTEGER,
          outcome TEXT,
          notes TEXT,
          recording_url TEXT,
          ai_summary TEXT,
          performance_score INTEGER,
          created_at TEXT NOT NULL,
          FOREIGN KEY (lead_id) REFERENCES leads(id)
        );

        CREATE INDEX idx_calls_lead_id ON calls(lead_id);
        CREATE INDEX idx_calls_team_id ON calls(team_id);
        CREATE INDEX idx_calls_started_at ON calls(started_at);
      `);
    }

    const calls = db.prepare(`
      SELECT * FROM calls
      WHERE team_id = ?
      ORDER BY started_at DESC
      LIMIT 100
    `).all(teamId);

    return NextResponse.json({ calls });

  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls - Create a new call record
 */
export async function POST(request: Request) {
  try {
    const body: CallRecord = await request.json();
    const {
      lead_id,
      caller_phone,
      prospect_phone,
      twilio_call_sid,
      status,
      started_at,
      ended_at,
      duration,
      outcome,
      notes,
      recording_url,
      ai_summary,
      performance_score,
    } = body;

    if (!lead_id || !status || !started_at) {
      return NextResponse.json(
        { error: 'lead_id, status, and started_at are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const teamId = getDefaultTeamId();

    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS calls (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        team_id TEXT NOT NULL,
        caller_phone TEXT,
        prospect_phone TEXT,
        twilio_call_sid TEXT,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration INTEGER,
        outcome TEXT,
        notes TEXT,
        recording_url TEXT,
        ai_summary TEXT,
        performance_score INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      );
    `);

    const id = `call-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const stmt = db.prepare(`
      INSERT INTO calls (
        id, lead_id, team_id, caller_phone, prospect_phone,
        twilio_call_sid, status, started_at, ended_at, duration,
        outcome, notes, recording_url, ai_summary,
        performance_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      lead_id,
      teamId,
      caller_phone || null,
      prospect_phone || null,
      twilio_call_sid || null,
      status,
      started_at,
      ended_at || null,
      duration || null,
      outcome || null,
      notes || null,
      recording_url || null,
      ai_summary || null,
      performance_score || null,
      new Date().toISOString()
    );

    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(id);

    return NextResponse.json({ call }, { status: 201 });

  } catch (error) {
    console.error('Error creating call record:', error);
    return NextResponse.json(
      { error: 'Failed to create call record' },
      { status: 500 }
    );
  }
}
