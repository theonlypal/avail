/**
 * Database initialization endpoint
 * Call this once after deploying to set up Postgres schema
 */

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { initializePostgresSchema } from '@/lib/db';
import { initializePostgresCRMSchema } from '@/lib/db-crm';

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

    // Create pg Pool for Railway Postgres
    const pool = new Pool({
      connectionString: postgresUrl,
      ssl: false, // Railway internal connections don't need SSL
      max: 5,
      idleTimeoutMillis: 30000,
    });

    // Initialize core schema
    await initializePostgresSchema();

    // Initialize CRM schema
    await initializePostgresCRMSchema();

    // Initialize live transcripts table (for WebSocket server)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_transcripts (
        id SERIAL PRIMARY KEY,
        call_sid TEXT NOT NULL,
        speaker TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        confidence REAL DEFAULT 0.99,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_live_transcripts_call_sid ON live_transcripts(call_sid)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_live_transcripts_timestamp ON live_transcripts(timestamp DESC)`);

    // Initialize activities table
    await pool.query(`
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
    `);

    // Seed default team if not exists
    const teamsResult = await pool.query('SELECT COUNT(*) as count FROM teams');
    if (Number(teamsResult.rows[0].count) === 0) {
      const teamId = 'avail-team-' + Date.now();
      await pool.query('INSERT INTO teams (id, team_name, subscription_tier) VALUES ($1, $2, $3)', [teamId, 'AVAIL', 'pro']);

      // Add team members
      await pool.query(`
        INSERT INTO team_members (id, team_id, name, email, role) VALUES
        ($1, $4, 'Zach', 'zach@avail.ai', 'owner'),
        ($2, $4, 'Ryan', 'ryan@avail.ai', 'manager'),
        ($3, $4, 'DC', 'dc@avail.ai', 'rep')
      `, [teamId + '-zach', teamId + '-ryan', teamId + '-dc', teamId]);
    }

    // Close the pool
    await pool.end();

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
