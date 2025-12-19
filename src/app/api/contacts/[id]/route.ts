/**
 * Contacts API Route (by ID) - PRODUCTION READY
 *
 * GET: Get contact by ID
 * PUT: Update contact
 * DELETE: Delete contact (soft delete with archived flag)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContactById } from '@/lib/db-crm';
import { Pool } from 'pg';
import path from 'path';

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
  return new Database(DB_PATH);
}

/**
 * GET /api/contacts/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await getContactById(id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });

  } catch (error: any) {
    console.error('❌ GET /api/contacts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/[id]
 * Body: Any contact fields to update
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
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'title', 'tags'];
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

    updates.updated_at = now;

    if (IS_PRODUCTION && pgPool) {
      // Build dynamic Postgres query with parameterized values
      // Handle tags as JSONB
      if (updates.tags) {
        updates.tags = JSON.stringify(updates.tags);
      }

      const keys = Object.keys(updates);
      const values = keys.map(key => {
        const val = updates[key];
        if (val instanceof Date) return val.toISOString();
        return val;
      });
      values.push(id);

      const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
      const result = await pgPool.query(
        `UPDATE contacts SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      console.log('✅ Contact updated via API:', id);
      return NextResponse.json({ success: true, contact: result.rows[0] });

    } else {
      // SQLite
      const db = getSqliteDb();

      const setClause = Object.keys(updates)
        .map(() => `? = ?`)
        .join(', ');

      const values: any[] = [];
      for (const [key, value] of Object.entries(updates)) {
        values.push(key);
        if (key === 'tags') {
          values.push(JSON.stringify(value));
        } else if (key === 'updated_at') {
          values.push((value as Date).toISOString());
        } else {
          values.push(value);
        }
      }
      values.push(id);

      const query = `UPDATE contacts SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (Array.isArray(v)) return JSON.stringify(v);
        if (v instanceof Date) return v.toISOString();
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      console.log('✅ Contact updated via API:', id);

      const updatedContact = await getContactById(id);
      return NextResponse.json({ success: true, contact: updatedContact });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/contacts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * Hard delete (cascades to deals, messages, appointments)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      console.log('✅ Contact deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      console.log('✅ Contact deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/contacts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact', details: error.message },
      { status: 500 }
    );
  }
}
