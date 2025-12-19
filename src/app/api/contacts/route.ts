/**
 * Contacts API Route - PRODUCTION READY
 *
 * Real CRUD operations for contacts with PostgreSQL
 * GET: List all contacts (with optional filtering)
 * POST: Create new contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { createContact, getContactsByBusiness, getContactById } from '@/lib/db-crm';
import { Pool } from 'pg';

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

/**
 * GET /api/contacts
 * Query params:
 *  - businessId: filter by business
 *  - search: search by name/email/phone
 *  - limit: pagination limit (default 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (businessId) {
      // Get contacts for specific business
      const contacts = await getContactsByBusiness(businessId);
      return NextResponse.json({ contacts });
    }

    // Get all contacts with optional search - JOIN with businesses table
    if (!pgPool) {
      return NextResponse.json({
        contacts: [],
        message: 'Database not configured'
      });
    }

    // Try to query with businesses table, fall back to just contacts if it doesn't exist
    try {
      let result;
      if (search) {
        const searchPattern = `%${search}%`;
        result = await pgPool.query(`
          SELECT
            c.*,
            b.name as business_name,
            b.industry as business_industry
          FROM contacts c
          LEFT JOIN businesses b ON c.business_id = b.id
          WHERE c.first_name ILIKE $1
             OR c.last_name ILIKE $1
             OR c.email ILIKE $1
             OR c.phone ILIKE $1
             OR b.name ILIKE $1
          ORDER BY c.created_at DESC
          LIMIT $2 OFFSET $3
        `, [searchPattern, limit, offset]);
      } else {
        result = await pgPool.query(`
          SELECT
            c.*,
            b.name as business_name,
            b.industry as business_industry
          FROM contacts c
          LEFT JOIN businesses b ON c.business_id = b.id
          ORDER BY c.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);
      }
      return NextResponse.json({ contacts: result.rows });
    } catch (joinError: any) {
      // If businesses table doesn't exist, fall back to just contacts
      if (joinError.code === '42P01') {
        console.warn('[Contacts API] businesses table does not exist, returning contacts only');
        let result;
        if (search) {
          const searchPattern = `%${search}%`;
          result = await pgPool.query(`
            SELECT c.*
            FROM contacts c
            WHERE c.first_name ILIKE $1
               OR c.last_name ILIKE $1
               OR c.email ILIKE $1
               OR c.phone ILIKE $1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
          `, [searchPattern, limit, offset]);
        } else {
          result = await pgPool.query(`
            SELECT c.*
            FROM contacts c
            ORDER BY c.created_at DESC
            LIMIT $1 OFFSET $2
          `, [limit, offset]);
        }
        return NextResponse.json({ contacts: result.rows });
      }
      throw joinError;
    }

  } catch (error: any) {
    console.error('❌ GET /api/contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Body: { business_id, first_name, last_name, email, phone?, title?, tags? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.business_id || !body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, first_name, last_name, email' },
        { status: 400 }
      );
    }

    const contact = await createContact({
      business_id: body.business_id,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      title: body.title,
      tags: body.tags || [],
    });

    console.log('✅ Contact created via API:', contact.id);

    return NextResponse.json({
      success: true,
      contact,
    });

  } catch (error: any) {
    console.error('❌ POST /api/contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact', details: error.message },
      { status: 500 }
    );
  }
}
