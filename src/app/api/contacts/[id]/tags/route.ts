/**
 * Contact Tags API Route - PRODUCTION READY
 *
 * GET: Get all tags for a contact
 * POST: Add tag to contact
 * DELETE: Remove tag from contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

function getSqliteDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  const db = new Database(DB_PATH);

  // Ensure junction table exists
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
 * GET /api/contacts/[id]/tags
 * Returns all tags assigned to this contact
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && sql) {
      const tags = await sql`
        SELECT t.*
        FROM tags t
        INNER JOIN contact_tags ct ON t.id = ct.tag_id
        WHERE ct.contact_id = ${id}
        ORDER BY t.name ASC
      `;
      return NextResponse.json({ tags });
    } else {
      const db = getSqliteDb();
      const tags = db.prepare(`
        SELECT t.*
        FROM tags t
        INNER JOIN contact_tags ct ON t.id = ct.tag_id
        WHERE ct.contact_id = ?
        ORDER BY t.name ASC
      `).all(id);
      return NextResponse.json({ tags });
    }

  } catch (error: any) {
    console.error('❌ GET /api/contacts/[id]/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact tags', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/[id]/tags
 * Body: { tag_id }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.tag_id) {
      return NextResponse.json(
        { error: 'Missing required field: tag_id' },
        { status: 400 }
      );
    }

    if (IS_PRODUCTION && sql) {
      // Check if already assigned
      const existing = await sql`SELECT * FROM contact_tags WHERE contact_id = ${id} AND tag_id = ${body.tag_id}`;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Tag already assigned to contact' },
          { status: 409 }
        );
      }

      await sql`INSERT INTO contact_tags (contact_id, tag_id) VALUES (${id}, ${body.tag_id})`;

      console.log('✅ Tag added to contact:', id, body.tag_id);
      return NextResponse.json({ success: true });

    } else {
      const db = getSqliteDb();

      // Check if already assigned
      const existing = db.prepare('SELECT * FROM contact_tags WHERE contact_id = ? AND tag_id = ?').get(id, body.tag_id);
      if (existing) {
        return NextResponse.json(
          { error: 'Tag already assigned to contact' },
          { status: 409 }
        );
      }

      db.prepare('INSERT INTO contact_tags (contact_id, tag_id) VALUES (?, ?)').run(id, body.tag_id);

      console.log('✅ Tag added to contact:', id, body.tag_id);
      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error('❌ POST /api/contacts/[id]/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]/tags
 * Body: { tag_id }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tag_id');

    if (!tagId) {
      return NextResponse.json(
        { error: 'Missing required query param: tag_id' },
        { status: 400 }
      );
    }

    if (IS_PRODUCTION && sql) {
      await sql`DELETE FROM contact_tags WHERE contact_id = ${id} AND tag_id = ${tagId}`;

      console.log('✅ Tag removed from contact:', id, tagId);
      return NextResponse.json({ success: true });

    } else {
      const db = getSqliteDb();
      db.prepare('DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?').run(id, tagId);

      console.log('✅ Tag removed from contact:', id, tagId);
      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/contacts/[id]/tags error:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from contact', details: error.message },
      { status: 500 }
    );
  }
}
