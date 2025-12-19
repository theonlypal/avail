/**
 * Contact Import API Route - PRODUCTION READY
 *
 * POST: Import contacts from CSV data
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

interface ImportRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  lifecycle_stage?: string;
}

/**
 * POST /api/contacts/import
 * Body: { team_id, contacts: ImportRow[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, contacts } = body;

    if (!team_id || !contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, contacts[]' },
        { status: 400 }
      );
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts to import' },
        { status: 400 }
      );
    }

    if (contacts.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 contacts per import' },
        { status: 400 }
      );
    }

    const now = new Date();
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Validate contacts
    const validContacts: (ImportRow & { id: string })[] = [];
    const seenEmails = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const rowNum = i + 1;

      // Check required fields
      if (!contact.first_name || !contact.last_name || !contact.email) {
        results.errors.push(`Row ${rowNum}: Missing required fields (first_name, last_name, email)`);
        results.skipped++;
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        results.errors.push(`Row ${rowNum}: Invalid email format`);
        results.skipped++;
        continue;
      }

      // Check for duplicates in import
      const emailLower = contact.email.toLowerCase();
      if (seenEmails.has(emailLower)) {
        results.errors.push(`Row ${rowNum}: Duplicate email in import`);
        results.skipped++;
        continue;
      }
      seenEmails.add(emailLower);

      // Validate lifecycle stage if provided
      if (contact.lifecycle_stage) {
        const validStages = ['lead', 'qualified', 'opportunity', 'customer', 'churned'];
        if (!validStages.includes(contact.lifecycle_stage)) {
          contact.lifecycle_stage = 'lead'; // Default to lead
        }
      }

      validContacts.push({
        id: uuidv4(),
        first_name: contact.first_name.trim(),
        last_name: contact.last_name.trim(),
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone?.trim() || null,
        company: contact.company?.trim() || null,
        title: contact.title?.trim() || null,
        lifecycle_stage: contact.lifecycle_stage || 'lead',
      });
    }

    if (validContacts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid contacts to import',
        results,
      });
    }

    if (IS_PRODUCTION && pgPool) {
      // Check for existing emails
      const emails = validContacts.map(c => c.email);
      const existing = await pgPool.query('SELECT email FROM contacts WHERE email = ANY($1)', [emails]);
      const existingEmails = new Set(existing.rows.map((r: any) => r.email.toLowerCase()));

      for (const contact of validContacts) {
        if (existingEmails.has(contact.email)) {
          results.errors.push(`${contact.email}: Already exists`);
          results.skipped++;
          continue;
        }

        try {
          await pgPool.query(`
            INSERT INTO contacts (id, team_id, business_id, first_name, last_name, email, phone, company, title, lifecycle_stage, source, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [contact.id, team_id, 'import', contact.first_name, contact.last_name, contact.email, contact.phone, contact.company, contact.title, contact.lifecycle_stage, 'import', now, now]);
          results.imported++;
        } catch (err: any) {
          results.errors.push(`${contact.email}: ${err.message}`);
          results.skipped++;
        }
      }

    } else {
      const db = getSqliteDb();

      // Check for existing emails
      const placeholders = validContacts.map(() => '?').join(',');
      const emails = validContacts.map(c => c.email);
      const existing = db.prepare(`SELECT email FROM contacts WHERE email IN (${placeholders})`).all(...emails) as any[];
      const existingEmails = new Set(existing.map(r => r.email.toLowerCase()));

      const insertStmt = db.prepare(`
        INSERT INTO contacts (id, team_id, business_id, first_name, last_name, email, phone, company, title, lifecycle_stage, source, created_at, updated_at)
        VALUES (?, ?, 'import', ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?)
      `);

      for (const contact of validContacts) {
        if (existingEmails.has(contact.email)) {
          results.errors.push(`${contact.email}: Already exists`);
          results.skipped++;
          continue;
        }

        try {
          insertStmt.run(
            contact.id,
            team_id,
            contact.first_name,
            contact.last_name,
            contact.email,
            contact.phone,
            contact.company,
            contact.title,
            contact.lifecycle_stage,
            now.toISOString(),
            now.toISOString()
          );
          results.imported++;
        } catch (err: any) {
          results.errors.push(`${contact.email}: ${err.message}`);
          results.skipped++;
        }
      }
    }

    console.log(`✅ Import completed: ${results.imported} imported, ${results.skipped} skipped`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.imported} contacts`,
      results,
    });

  } catch (error: any) {
    console.error('❌ POST /api/contacts/import error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts', details: error.message },
      { status: 500 }
    );
  }
}
