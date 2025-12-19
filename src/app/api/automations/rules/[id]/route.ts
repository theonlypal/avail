/**
 * Automation Rules API Route (by ID) - PRODUCTION READY
 *
 * GET: Get rule by ID
 * PUT: Update rule
 * DELETE: Delete rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAutomationDb } from '@/lib/db-automation';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

async function getRuleById(id: string) {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query('SELECT * FROM automation_rules WHERE id = $1', [id]);
    return result.rows[0] || null;
  } else {
    const db = getAutomationDb();
    const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id) as any;
    if (!rule) return null;
    return {
      ...rule,
      trigger_config: JSON.parse(rule.trigger_config || '{}'),
      actions: JSON.parse(rule.actions || '[]'),
      is_active: !!rule.is_active,
    };
  }
}

/**
 * GET /api/automations/rules/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rule = await getRuleById(id);

    if (!rule) {
      return NextResponse.json(
        { error: 'Automation rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule });

  } catch (error: any) {
    console.error('❌ GET /api/automations/rules/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation rule', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/automations/rules/[id]
 * Body: Any rule fields to update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date();

    const allowedFields = ['name', 'description', 'trigger_type', 'trigger_config', 'actions', 'is_active'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'trigger_config' || field === 'actions') {
          updates[field] = JSON.stringify(body[field]);
        } else if (field === 'is_active') {
          updates[field] = body[field] ? 1 : 0;
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = now.toISOString();

    if (IS_PRODUCTION && pgPool) {
      const keys = Object.keys(updates);
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const values = [...Object.values(updates), id];

      const result = await pgPool.query(
        `UPDATE automation_rules SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Automation rule not found' },
          { status: 404 }
        );
      }

      console.log('✅ Automation rule updated:', id);
      return NextResponse.json({ success: true, rule: result.rows[0] });

    } else {
      const db = getAutomationDb();

      const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(updates), id];

      const result = db.prepare(`UPDATE automation_rules SET ${setClause} WHERE id = ?`).run(...values);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Automation rule not found' },
          { status: 404 }
        );
      }

      const updatedRule = await getRuleById(id);
      console.log('✅ Automation rule updated:', id);
      return NextResponse.json({ success: true, rule: updatedRule });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/automations/rules/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update automation rule', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/automations/rules/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      // Delete related logs and queue items
      await pgPool.query('DELETE FROM automation_logs WHERE rule_id = $1', [id]);
      await pgPool.query('DELETE FROM automation_queue WHERE rule_id = $1', [id]);

      const result = await pgPool.query('DELETE FROM automation_rules WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Automation rule not found' },
          { status: 404 }
        );
      }

      console.log('✅ Automation rule deleted:', id);
      return NextResponse.json({ success: true, deletedId: id });

    } else {
      const db = getAutomationDb();

      // Delete related logs and queue items
      db.prepare('DELETE FROM automation_logs WHERE rule_id = ?').run(id);
      db.prepare('DELETE FROM automation_queue WHERE rule_id = ?').run(id);

      const result = db.prepare('DELETE FROM automation_rules WHERE id = ?').run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Automation rule not found' },
          { status: 404 }
        );
      }

      console.log('✅ Automation rule deleted:', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

  } catch (error: any) {
    console.error('❌ DELETE /api/automations/rules/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete automation rule', details: error.message },
      { status: 500 }
    );
  }
}
