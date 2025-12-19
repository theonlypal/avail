/**
 * Deals API Route - PRODUCTION READY
 *
 * Real CRUD operations for deals with PostgreSQL
 * GET: List all deals (with optional filtering)
 * POST: Create new deal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDeal, getDealsByContact } from '@/lib/db-crm';
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
 * GET /api/deals
 * Query params:
 *  - contactId: filter by contact
 *  - stage: filter by stage (new, contacted, qualified, demo, proposal, negotiation, closed_won, closed_lost)
 *  - limit: pagination limit (default 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (contactId) {
      // Get deals for specific contact
      const deals = await getDealsByContact(contactId);
      return NextResponse.json({ deals });
    }

    // Get all deals with optional stage filter - JOIN with contacts table
    if (IS_PRODUCTION && pgPool) {
      let result;
      if (stage) {
        result = await pgPool.query(`
          SELECT
            d.*,
            jsonb_build_object(
              'first_name', c.first_name,
              'last_name', c.last_name,
              'email', c.email
            ) as contact
          FROM deals d
          LEFT JOIN contacts c ON d.contact_id = c.id
          WHERE d.stage = $1
          ORDER BY d.created_at DESC
          LIMIT $2 OFFSET $3
        `, [stage, limit, offset]);
      } else {
        result = await pgPool.query(`
          SELECT
            d.*,
            jsonb_build_object(
              'first_name', c.first_name,
              'last_name', c.last_name,
              'email', c.email
            ) as contact
          FROM deals d
          LEFT JOIN contacts c ON d.contact_id = c.id
          ORDER BY d.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);
      }
      return NextResponse.json({ deals: result.rows });
    } else {
      // SQLite with JOIN
      const db = getSqliteDb();
      let query = `
        SELECT
          d.id,
          d.contact_id,
          d.stage,
          d.value,
          d.source,
          d.created_by,
          d.pipeline_id,
          d.notes,
          d.created_at,
          d.updated_at,
          c.first_name,
          c.last_name,
          c.email
        FROM deals d
        LEFT JOIN contacts c ON d.contact_id = c.id
      `;
      const params: any[] = [];

      if (stage) {
        query += ' WHERE d.stage = ?';
        params.push(stage);
      }

      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rawDeals = db.prepare(query).all(...params);

      // Transform SQLite results to match expected format
      const deals = rawDeals.map((row: any) => ({
        id: row.id,
        contact_id: row.contact_id,
        stage: row.stage,
        value: row.value,
        source: row.source,
        created_by: row.created_by,
        pipeline_id: row.pipeline_id,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        contact: {
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
        },
      }));

      return NextResponse.json({ deals });
    }

  } catch (error: any) {
    console.error('❌ GET /api/deals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals
 * Body: { contact_id, stage, value?, source?, created_by?, pipeline_id?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.contact_id || !body.stage) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_id, stage' },
        { status: 400 }
      );
    }

    // Validate stage
    const validStages = ['new', 'contacted', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    if (!validStages.includes(body.stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    const deal = await createDeal({
      contact_id: body.contact_id,
      stage: body.stage,
      value: body.value || 0,
      source: body.source,
      created_by: body.created_by,
      pipeline_id: body.pipeline_id,
      notes: body.notes,
    });

    console.log('✅ Deal created via API:', deal.id, '- Stage:', deal.stage);

    return NextResponse.json({
      success: true,
      deal,
    });

  } catch (error: any) {
    console.error('❌ POST /api/deals error:', error);
    return NextResponse.json(
      { error: 'Failed to create deal', details: error.message },
      { status: 500 }
    );
  }
}
