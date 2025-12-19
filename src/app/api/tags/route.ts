/**
 * Tags API Route - PRODUCTION READY
 *
 * GET: List all tags for a team
 * POST: Create new tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Ensure tags table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, name)
    )
  `);

  // Contact tags junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_tags (
      contact_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (contact_id, tag_id)
    )
  `);

  return db;
}

/**
 * GET /api/tags
 * Query params:
 *  - team_id: Filter by team (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(`
        SELECT t.*, COUNT(ct.contact_id) as contact_count
        FROM tags t
        LEFT JOIN contact_tags ct ON t.id = ct.tag_id
        WHERE t.team_id = $1
        GROUP BY t.id
        ORDER BY t.name ASC
      `, [teamId]);
      return NextResponse.json({ tags: result.rows });
    } else {
      const db = getSqliteDb();
      const tags = db.prepare(`
        SELECT t.*, COUNT(ct.contact_id) as contact_count
        FROM tags t
        LEFT JOIN contact_tags ct ON t.id = ct.tag_id
        WHERE t.team_id = ?
        GROUP BY t.id
        ORDER BY t.name ASC
      `).all(teamId);
      return NextResponse.json({ tags });
    }

  } catch (error: any) {
    console.error('❌ GET /api/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Body: { team_id, name, color? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, name' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();
    const color = body.color || '#6366f1';

    if (IS_PRODUCTION && pgPool) {
      // Check for duplicate
      const existing = await pgPool.query('SELECT id FROM tags WHERE team_id = $1 AND name = $2', [body.team_id, body.name]);
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 409 }
        );
      }

      const result = await pgPool.query(`
        INSERT INTO tags (id, team_id, name, color, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [id, body.team_id, body.name, color, now]);

      console.log('✅ Tag created via API:', id);
      return NextResponse.json({ success: true, tag: result.rows[0] });

    } else {
      const db = getSqliteDb();

      // Check for duplicate
      const existing = db.prepare('SELECT id FROM tags WHERE team_id = ? AND name = ?').get(body.team_id, body.name);
      if (existing) {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 409 }
        );
      }

      db.prepare(`
        INSERT INTO tags (id, team_id, name, color, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, body.team_id, body.name, color, now.toISOString());

      const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);

      console.log('✅ Tag created via API:', id);
      return NextResponse.json({ success: true, tag });
    }

  } catch (error: any) {
    console.error('❌ POST /api/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to create tag', details: error.message },
      { status: 500 }
    );
  }
}
