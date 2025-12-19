/**
 * Database initialization endpoint
 * Call this once after deploying to set up Postgres schema
 */

import { NextResponse } from 'next/server';
import { initializePostgresSchema } from '@/lib/db';
import { initializePostgresCRMSchema } from '@/lib/db-crm';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    // Allow in production environments (Vercel or Railway)
    const isProduction = process.env.VERCEL === '1' || process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';

    if (!isProduction && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'This endpoint only works in production (Vercel/Railway)',
      }, { status: 400 });
    }

    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!postgresUrl) {
      return NextResponse.json({
        error: 'No database URL configured',
        details: 'Set POSTGRES_URL or DATABASE_URL environment variable',
      }, { status: 500 });
    }

    const sql = neon(postgresUrl);

    // Initialize core schema
    await initializePostgresSchema();

    // Initialize CRM schema
    await initializePostgresCRMSchema();

    // Initialize live transcripts table (for WebSocket server)
    await sql`
      CREATE TABLE IF NOT EXISTS live_transcripts (
        id SERIAL PRIMARY KEY,
        call_sid TEXT NOT NULL,
        speaker TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        confidence REAL DEFAULT 0.99,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_live_transcripts_call_sid ON live_transcripts(call_sid)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_live_transcripts_timestamp ON live_transcripts(timestamp DESC)`;

    // Initialize activities table
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        contact_id TEXT,
        deal_id TEXT,
        lead_id TEXT,
        assigned_to TEXT,
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        outcome TEXT,
        duration_minutes INTEGER,
        metadata JSONB,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Seed default team if not exists
    const teams = await sql`SELECT COUNT(*) as count FROM teams`;
    if (Number(teams[0].count) === 0) {
      const teamId = 'avail-team-' + Date.now();
      await sql`INSERT INTO teams (id, team_name, subscription_tier) VALUES (${teamId}, ${'AVAIL'}, ${'pro'})`;

      // Add team members
      await sql`INSERT INTO team_members (id, team_id, name, email, role) VALUES
        (${teamId + '-zach'}, ${teamId}, ${'Zach'}, ${'zach@avail.ai'}, ${'owner'}),
        (${teamId + '-ryan'}, ${teamId}, ${'Ryan'}, ${'ryan@avail.ai'}, ${'manager'}),
        (${teamId + '-dc'}, ${teamId}, ${'DC'}, ${'dc@avail.ai'}, ${'rep'})
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'All database schemas initialized successfully (core, CRM, transcripts, activities)',
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error.message,
    }, { status: 500 });
  }
}
