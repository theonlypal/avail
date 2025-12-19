/**
 * Automation Template Individual API Route - PRODUCTION READY
 *
 * GET: Get single template
 * PUT: Update template
 * DELETE: Delete template
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

/**
 * GET /api/automations/templates/[id]
 * Get a single template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let template: any = null;

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(
        'SELECT * FROM automation_templates WHERE id = $1',
        [id]
      );
      template = result.rows[0];
    } else {
      const db = getAutomationDb();
      template = db.prepare('SELECT * FROM automation_templates WHERE id = ?').get(id);
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });

  } catch (error: any) {
    console.error('❌ GET /api/automations/templates/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/automations/templates/[id]
 * Update a template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date();

    if (IS_PRODUCTION && pgPool) {
      // Build update dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (body.name !== undefined) {
        updates.push('name');
        values.push(body.name);
      }
      if (body.type !== undefined) {
        updates.push('type');
        values.push(body.type);
      }
      if (body.subject !== undefined) {
        updates.push('subject');
        values.push(body.subject);
      }
      if (body.body !== undefined) {
        updates.push('body');
        values.push(body.body);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      // Use direct update with COALESCE
      await pgPool.query(
        `UPDATE automation_templates
         SET name = COALESCE($1, name),
             type = COALESCE($2, type),
             subject = COALESCE($3, subject),
             body = COALESCE($4, body),
             updated_at = $5
         WHERE id = $6`,
        [body.name, body.type, body.subject, body.body, now, id]
      );

      const result = await pgPool.query(
        'SELECT * FROM automation_templates WHERE id = $1',
        [id]
      );

      console.log('✅ Automation template updated:', id);
      return NextResponse.json({ success: true, template: result.rows[0] });

    } else {
      const db = getAutomationDb();

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (body.name !== undefined) {
        updates.push('name = ?');
        values.push(body.name);
      }
      if (body.type !== undefined) {
        updates.push('type = ?');
        values.push(body.type);
      }
      if (body.subject !== undefined) {
        updates.push('subject = ?');
        values.push(body.subject);
      }
      if (body.body !== undefined) {
        updates.push('body = ?');
        values.push(body.body);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      updates.push('updated_at = ?');
      values.push(now.toISOString());
      values.push(id);

      db.prepare(`
        UPDATE automation_templates
        SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...values);

      const template = db.prepare('SELECT * FROM automation_templates WHERE id = ?').get(id);

      console.log('✅ Automation template updated:', id);
      return NextResponse.json({ success: true, template });
    }

  } catch (error: any) {
    console.error('❌ PUT /api/automations/templates/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/automations/templates/[id]
 * Delete a template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (IS_PRODUCTION && pgPool) {
      await pgPool.query('DELETE FROM automation_templates WHERE id = $1', [id]);
    } else {
      const db = getAutomationDb();
      db.prepare('DELETE FROM automation_templates WHERE id = ?').run(id);
    }

    console.log('✅ Automation template deleted:', id);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ DELETE /api/automations/templates/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: error.message },
      { status: 500 }
    );
  }
}
