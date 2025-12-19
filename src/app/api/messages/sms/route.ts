/**
 * SMS Messages API Route - PRODUCTION READY
 *
 * Real SMS operations with Twilio integration
 * GET: List SMS messages (with optional filtering by contact)
 * POST: Send SMS via Twilio and log to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMessage, getMessagesByContact } from '@/lib/db-crm';
import { sendSMS, isTwilioConfigured } from '@/lib/integrations/twilio';
import { Pool } from 'pg';
import path from 'path';

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

/**
 * GET /api/messages/sms
 * Query params:
 *  - contactId: filter by contact (REQUIRED for now)
 *  - limit: pagination limit (default 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!contactId) {
      // Get all SMS messages (across all contacts)
      if (IS_PRODUCTION && pgPool) {
        const result = await pgPool.query(
          `SELECT * FROM messages
          WHERE channel = 'sms'
          ORDER BY sent_at DESC
          LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        return NextResponse.json({ messages: result.rows });
      } else {
        const db = getSqliteDb();
        const messages = db
          .prepare('SELECT * FROM messages WHERE channel = ? ORDER BY sent_at DESC LIMIT ? OFFSET ?')
          .all('sms', limit, offset);
        return NextResponse.json({ messages });
      }
    }

    // Get messages for specific contact
    const allMessages = await getMessagesByContact(contactId);
    const smsMessages = allMessages.filter((msg) => msg.channel === 'sms');

    return NextResponse.json({ messages: smsMessages });

  } catch (error: any) {
    console.error('❌ GET /api/messages/sms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS messages', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/sms
 * Body: { contact_id, to, body }
 * Sends SMS via Twilio and logs to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.contact_id || !body.to || !body.body) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_id, to, body' },
        { status: 400 }
      );
    }

    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { error: 'Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.' },
        { status: 503 }
      );
    }

    // Send SMS via Twilio
    const smsResult = await sendSMS({
      to: body.to,
      body: body.body,
    });

    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: smsResult.error },
        { status: 500 }
      );
    }

    // Log message to database
    const message = await createMessage({
      contact_id: body.contact_id,
      direction: 'outbound',
      channel: 'sms',
      body: body.body,
      status: smsResult.status || 'sent',
      twilio_sid: smsResult.messageSid,
      sent_at: new Date(),
    });

    console.log('✅ SMS sent via API:', smsResult.messageSid, '→', body.to);

    return NextResponse.json({
      success: true,
      message,
      twilioSid: smsResult.messageSid,
      twilioStatus: smsResult.status,
    });

  } catch (error: any) {
    console.error('❌ POST /api/messages/sms error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS', details: error.message },
      { status: 500 }
    );
  }
}
