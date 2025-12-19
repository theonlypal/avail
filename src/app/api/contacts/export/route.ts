/**
 * Contact Export API Route - PRODUCTION READY
 *
 * GET: Export contacts as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
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

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/contacts/export
 * Query params:
 *  - team_id: Filter by team (required)
 *  - format: 'csv' (default)
 *  - lifecycle_stage: Optional filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id') || 'default-team';
    const lifecycleStage = searchParams.get('lifecycle_stage');

    let contacts: any[] = [];

    if (IS_PRODUCTION && pgPool) {
      const conditions: string[] = ['team_id = $1'];
      const params: any[] = [teamId];
      let paramIndex = 2;

      if (lifecycleStage) {
        conditions.push(`lifecycle_stage = $${paramIndex}`);
        params.push(lifecycleStage);
        paramIndex++;
      }

      const query = `
        SELECT
          first_name, last_name, email, phone, company, title,
          lifecycle_stage, source, created_at
        FROM contacts
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
      `;

      const result = await pgPool.query(query, params);
      contacts = result.rows;
    } else {
      const db = getSqliteDb();

      let query = `
        SELECT
          first_name, last_name, email, phone, company, title,
          lifecycle_stage, source, created_at
        FROM contacts
        WHERE team_id = ?
      `;
      const params: any[] = [teamId];

      if (lifecycleStage) {
        query += ` AND lifecycle_stage = ?`;
        params.push(lifecycleStage);
      }

      query += ` ORDER BY created_at DESC`;

      contacts = db.prepare(query).all(...params) as any[];
    }

    // Build CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Lifecycle Stage', 'Source', 'Created At'];
    const csvRows = [headers.join(',')];

    for (const contact of contacts) {
      const row = [
        escapeCSV(contact.first_name),
        escapeCSV(contact.last_name),
        escapeCSV(contact.email),
        escapeCSV(contact.phone),
        escapeCSV(contact.company),
        escapeCSV(contact.title),
        escapeCSV(contact.lifecycle_stage),
        escapeCSV(contact.source),
        escapeCSV(contact.created_at),
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');
    const filename = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('❌ GET /api/contacts/export error:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts', details: error.message },
      { status: 500 }
    );
  }
}
