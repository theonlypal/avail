/**
 * Automation Templates API Route - PRODUCTION READY
 *
 * GET: List templates
 * POST: Create new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAutomationDb } from '@/lib/db-automation';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

/**
 * GET /api/automations/templates
 * Query params:
 *  - team_id: Filter by team
 *  - type: Filter by type (sms, email)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const type = searchParams.get('type');

    if (IS_PRODUCTION && pgPool) {
      let query = 'SELECT * FROM automation_templates WHERE team_id = $1';
      const params: any[] = [teamId];

      if (type) {
        query += ' AND type = $2';
        params.push(type);
      }

      query += ' ORDER BY name ASC';

      const result = await pgPool.query(query, params);
      return NextResponse.json({ templates: result.rows });
    } else {
      const db = getAutomationDb();

      let query = `SELECT * FROM automation_templates WHERE team_id = ?`;
      const params: any[] = [teamId];

      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }

      query += ` ORDER BY name ASC`;

      const templates = db.prepare(query).all(...params);
      return NextResponse.json({ templates });
    }

  } catch (error: any) {
    console.error('❌ GET /api/automations/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automations/templates
 * Body: { team_id, name, type, subject?, body }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.name || !body.type || !body.body) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, name, type, body' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['sms', 'email'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "sms" or "email"' },
        { status: 400 }
      );
    }

    // Email requires subject
    if (body.type === 'email' && !body.subject) {
      return NextResponse.json(
        { error: 'Email templates require a subject' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(
        `INSERT INTO automation_templates (id, team_id, name, type, subject, body, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, body.team_id, body.name, body.type, body.subject || null, body.body, now, now]
      );

      console.log('✅ Automation template created:', id);
      return NextResponse.json({ success: true, template: result.rows[0] });

    } else {
      const db = getAutomationDb();

      db.prepare(`
        INSERT INTO automation_templates (id, team_id, name, type, subject, body, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, body.team_id, body.name, body.type, body.subject || null, body.body, now.toISOString(), now.toISOString());

      const template = db.prepare('SELECT * FROM automation_templates WHERE id = ?').get(id);

      console.log('✅ Automation template created:', id);
      return NextResponse.json({ success: true, template });
    }

  } catch (error: any) {
    console.error('❌ POST /api/automations/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error.message },
      { status: 500 }
    );
  }
}
