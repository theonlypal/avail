/**
 * Automation Rules API Route - PRODUCTION READY
 *
 * GET: List automation rules
 * POST: Create new automation rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getAutomationDb, type AutomationRule, type TriggerType } from '@/lib/db-automation';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const sql = IS_PRODUCTION && process.env.POSTGRES_URL ? neon(process.env.POSTGRES_URL) : null;

const VALID_TRIGGER_TYPES: TriggerType[] = [
  'lead_created',
  'lead_score_changed',
  'contact_created',
  'deal_created',
  'deal_stage_changed',
  'deal_won',
  'deal_lost',
  'form_submitted',
  'booking_scheduled',
  'no_response',
  'tag_added',
];

/**
 * GET /api/automations/rules
 * Query params:
 *  - team_id: Filter by team
 *  - is_active: Filter by active status
 *  - trigger_type: Filter by trigger type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const isActive = searchParams.get('is_active');
    const triggerType = searchParams.get('trigger_type');

    if (IS_PRODUCTION && sql) {
      let query = `SELECT * FROM automation_rules WHERE team_id = '${teamId}'`;

      if (isActive !== null) {
        query += ` AND is_active = ${isActive === 'true'}`;
      }
      if (triggerType) {
        query += ` AND trigger_type = '${triggerType}'`;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await sql.unsafe(query);
      const rules = Array.isArray(result) ? result : [];
      return NextResponse.json({ rules });
    } else {
      const db = getAutomationDb();

      let query = `SELECT * FROM automation_rules WHERE team_id = ?`;
      const params: any[] = [teamId];

      if (isActive !== null) {
        query += ` AND is_active = ?`;
        params.push(isActive === 'true' ? 1 : 0);
      }
      if (triggerType) {
        query += ` AND trigger_type = ?`;
        params.push(triggerType);
      }

      query += ` ORDER BY created_at DESC`;

      const rules = db.prepare(query).all(...params).map((rule: any) => ({
        ...rule,
        trigger_config: JSON.parse(rule.trigger_config || '{}'),
        actions: JSON.parse(rule.actions || '[]'),
        is_active: !!rule.is_active,
      }));

      return NextResponse.json({ rules });
    }

  } catch (error: any) {
    console.error('❌ GET /api/automations/rules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation rules', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automations/rules
 * Body: { team_id, name, description?, trigger_type, trigger_config?, actions, is_active? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.team_id || !body.name || !body.trigger_type || !body.actions) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, name, trigger_type, actions' },
        { status: 400 }
      );
    }

    // Validate trigger type
    if (!VALID_TRIGGER_TYPES.includes(body.trigger_type)) {
      return NextResponse.json(
        { error: `Invalid trigger_type. Must be one of: ${VALID_TRIGGER_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate actions array
    if (!Array.isArray(body.actions) || body.actions.length === 0) {
      return NextResponse.json(
        { error: 'Actions must be a non-empty array' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    if (IS_PRODUCTION && sql) {
      const result = await sql`
        INSERT INTO automation_rules (
          id, team_id, name, description, trigger_type, trigger_config,
          actions, is_active, created_at, updated_at
        )
        VALUES (
          ${id}, ${body.team_id}, ${body.name}, ${body.description || null},
          ${body.trigger_type}, ${JSON.stringify(body.trigger_config || {})},
          ${JSON.stringify(body.actions)}, ${body.is_active !== false},
          ${now}, ${now}
        )
        RETURNING *
      `;

      console.log('✅ Automation rule created:', id);
      return NextResponse.json({ success: true, rule: result[0] });

    } else {
      const db = getAutomationDb();

      db.prepare(`
        INSERT INTO automation_rules (
          id, team_id, name, description, trigger_type, trigger_config,
          actions, is_active, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.team_id, body.name, body.description || null,
        body.trigger_type, JSON.stringify(body.trigger_config || {}),
        JSON.stringify(body.actions), body.is_active !== false ? 1 : 0,
        now.toISOString(), now.toISOString()
      );

      const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id) as any;

      console.log('✅ Automation rule created:', id);
      return NextResponse.json({
        success: true,
        rule: {
          ...rule,
          trigger_config: JSON.parse(rule.trigger_config || '{}'),
          actions: JSON.parse(rule.actions || '[]'),
          is_active: !!rule.is_active,
        },
      });
    }

  } catch (error: any) {
    console.error('❌ POST /api/automations/rules error:', error);
    return NextResponse.json(
      { error: 'Failed to create automation rule', details: error.message },
      { status: 500 }
    );
  }
}
