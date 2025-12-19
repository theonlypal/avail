/**
 * Deals API Route (by ID) - PRODUCTION READY
 *
 * GET: Get deal by ID
 * PUT: Update deal (most commonly used for stage transitions)
 * DELETE: Delete deal
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import path from 'path';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

function getSqliteDb(): any {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

async function getDealById(id: string) {
  if (IS_PRODUCTION && sql) {
    const result = await sql`SELECT * FROM deals WHERE id = ${id}`;
    return result[0] || null;
  } else {
    const db = getSqliteDb();
    return db.prepare('SELECT * FROM deals WHERE id = ?').get(id) || null;
  }
}

/**
 * GET /api/deals/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await getDealById(id);

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deal });

  } catch (error: any) {
    console.error('❌ GET /api/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/deals/[id]
 * Body: Any deal fields to update
 * Common use: Update stage (triggers automation rules in future)
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
    const allowedFields = ['stage', 'value', 'source', 'created_by', 'pipeline_id', 'notes'];
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

    // Validate stage if provided
    if (updates.stage) {
      const validStages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'demo', 'closed_won', 'closed_lost'];
      if (!validStages.includes(updates.stage)) {
        return NextResponse.json(
          { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
          { status: 400 }
        );
      }
    }

    updates.updated_at = now;

    if (IS_PRODUCTION && sql) {
      // Postgres update - Build SET clause
      const setClause = Object.keys(updates).map(key => `${key} = '${updates[key]}'`).join(', ');
      const result = await sql`UPDATE deals SET ${sql.unsafe(setClause)} WHERE id = ${id} RETURNING *`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }

      console.log('✅ Deal updated via API:', id, updates.stage ? `→ ${updates.stage}` : '');
      return NextResponse.json({ success: true, deal: result[0] });

    } else {
      // SQLite
      const db = getSqliteDb();

      const query = `UPDATE deals SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
      const valuesOnly = Object.values(updates).map(v => {
        if (v instanceof Date) return v.toISOString();
        return v;
      });
      valuesOnly.push(id);

      const result = db.prepare(query).run(...valuesOnly);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }

      console.log('✅ Deal updated via API:', id, updates.stage ? `→ ${updates.stage}` : '');

      const updatedDeal = await getDealById(id);
      return NextResponse.json({ success: true, deal: updatedDeal });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update deal', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && sql) {
      const result = await sql`DELETE FROM deals WHERE id = ${id} RETURNING id`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }

      console.log('✅ Deal deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getSqliteDb();
      const result = db.prepare('DELETE FROM deals WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }

      console.log('✅ Deal deleted via API:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal', details: error.message },
      { status: 500 }
    );
  }
}
