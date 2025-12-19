/**
 * Tags API Route (by ID) - PRODUCTION READY
 *
 * GET: Get tag by ID
 * PUT: Update tag (name, color)
 * DELETE: Delete tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: false,
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

async function getTagById(id: string) {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM tags WHERE id = $1', [id]);
    return result.rows[0] || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM tags WHERE id = ?').get(id) || null;
  }
}

/**
 * GET /api/tags/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tag = await getTagById(id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });

  } catch (error: any) {
    console.error('❌ GET /api/tags/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tags/[id]
 * Body: { name?, color? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name');
      values.push(body.name);
    }
    if (body.color !== undefined) {
      updates.push('color');
      values.push(body.color);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    if (IS_PRODUCTION && pgPool) {
      // Check if tag exists and get team_id for uniqueness check
      const existing = await pgPool.query('SELECT * FROM tags WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }

      // Check for duplicate name if updating name
      if (body.name) {
        const duplicate = await pgPool.query('SELECT id FROM tags WHERE team_id = $1 AND name = $2 AND id != $3', [existing.rows[0].team_id, body.name, id]);
        if (duplicate.rows.length > 0) {
          return NextResponse.json(
            { error: 'A tag with this name already exists' },
            { status: 409 }
          );
        }
      }

      const setClause = updates.map((field, i) => `${field} = $${i + 1}`).join(', ');
      values.push(id);
      const result = await pgPool.query(`UPDATE tags SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);

      console.log('✅ Tag updated via API:', id);
      return NextResponse.json({ success: true, tag: result.rows[0] });

    } else {
      const db = getSqliteDb();

      // Check if tag exists
      const existing = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as any;
      if (!existing) {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }

      // Check for duplicate name
      if (body.name) {
        const duplicate = db.prepare('SELECT id FROM tags WHERE team_id = ? AND name = ? AND id != ?').get(existing.team_id, body.name, id);
        if (duplicate) {
          return NextResponse.json(
            { error: 'A tag with this name already exists' },
            { status: 409 }
          );
        }
      }

      const setClause = updates.map(field => `${field} = ?`).join(', ');
      db.prepare(`UPDATE tags SET ${setClause} WHERE id = ?`).run(...values, id);

      const updatedTag = await getTagById(id);
      console.log('✅ Tag updated via API:', id);
      return NextResponse.json({ success: true, tag: updatedTag });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/tags/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update tag', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tags/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      // Delete tag assignments first
      await pgPool.query('DELETE FROM contact_tags WHERE tag_id = $1', [id]);

      const result = await pgPool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }

      console.log('✅ Tag deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();

      // Delete tag assignments first
      db.prepare('DELETE FROM contact_tags WHERE tag_id = ?').run(id);

      const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }

      console.log('✅ Tag deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/tags/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag', details: error.message },
      { status: 500 }
    );
  }
}
