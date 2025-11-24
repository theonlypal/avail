/**
 * Contacts API Route - PRODUCTION READY
 *
 * Real CRUD operations for contacts with Neon Postgres
 * GET: List all contacts (with optional filtering)
 * POST: Create new contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { createContact, getContactsByBusiness, getContactById } from '@/lib/db-crm';
import { neon } from '@neondatabase/serverless';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = IS_PRODUCTION && postgresUrl ? neon(postgresUrl) : null;

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
    if (!sql) {
      return NextResponse.json({
        contacts: [],
        message: 'Database not configured'
      });
    }

    // Try to query with businesses table, fall back to just contacts if it doesn't exist
    try {
      let query;
      if (search) {
        query = sql`
          SELECT
            c.*,
            b.name as business_name,
            b.industry as business_industry
          FROM contacts c
          LEFT JOIN businesses b ON c.business_id = b.id
          WHERE c.first_name ILIKE ${`%${search}%`}
             OR c.last_name ILIKE ${`%${search}%`}
             OR c.email ILIKE ${`%${search}%`}
             OR c.phone ILIKE ${`%${search}%`}
             OR b.name ILIKE ${`%${search}%`}
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        query = sql`
          SELECT
            c.*,
            b.name as business_name,
            b.industry as business_industry
          FROM contacts c
          LEFT JOIN businesses b ON c.business_id = b.id
          ORDER BY c.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      const contacts = await query;
      return NextResponse.json({ contacts });
    } catch (joinError: any) {
      // If businesses table doesn't exist, fall back to just contacts
      if (joinError.code === '42P01') {
        console.warn('[Contacts API] businesses table does not exist, returning contacts only');
        let fallbackQuery;
        if (search) {
          fallbackQuery = sql`
            SELECT c.*
            FROM contacts c
            WHERE c.first_name ILIKE ${`%${search}%`}
               OR c.last_name ILIKE ${`%${search}%`}
               OR c.email ILIKE ${`%${search}%`}
               OR c.phone ILIKE ${`%${search}%`}
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          fallbackQuery = sql`
            SELECT c.*
            FROM contacts c
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
        const contacts = await fallbackQuery;
        return NextResponse.json({ contacts });
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
