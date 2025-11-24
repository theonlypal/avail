import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = IS_PRODUCTION && postgresUrl ? neon(postgresUrl) : null;

function getSqliteDb(): Database.Database {
  const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');
  return new Database(DB_PATH);
}

/**
 * POST /api/calls/initiate
 *
 * Initiates an outbound call to a lead using Twilio
 *
 * Body:
 * {
 *   lead_id: string;
 *   to_number: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, to_number } = body;

    if (!lead_id || !to_number) {
      return NextResponse.json(
        { error: 'lead_id and to_number are required' },
        { status: 400 }
      );
    }

    // Check if Twilio is configured
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to environment variables.' },
        { status: 500 }
      );
    }

    // Get app URL for callbacks (Railway or Vercel or local)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');

    // REAL Twilio call - NO DEMO MODE
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);

      console.log('[Twilio] Initiating call to:', to_number, 'from:', twilioPhoneNumber);

      const call = await client.calls.create({
        to: to_number,
        from: twilioPhoneNumber,
        url: `${appUrl}/api/calls/twiml`,
        statusCallback: `${appUrl}/api/calls/status?lead_id=${encodeURIComponent(lead_id)}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true,
      });

      console.log('[Twilio] Call created successfully. SID:', call.sid, 'Status:', call.status);

      // Create call log in database (optional - skip if tables don't exist yet)
      try {
        const callId = uuidv4();
        const now = new Date().toISOString();

        if (IS_PRODUCTION && sql) {
          // Try to insert into Postgres (might fail if table doesn't exist)
          await sql`
            INSERT INTO call_logs (id, lead_id, call_sid, status, direction, started_at, created_at)
            VALUES (${callId}, ${lead_id}, ${call.sid}, ${'initiated'}, ${'outbound'}, ${now}, ${now})
          `.catch(() => {
            console.log('[DB] call_logs table does not exist yet, skipping log');
          });
        } else {
          // SQLite
          const db = getSqliteDb();
          db.prepare(`
            INSERT INTO call_logs (id, lead_id, call_sid, status, direction, started_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(callId, lead_id, call.sid, 'initiated', 'outbound', now, now);
        }
      } catch (dbError) {
        console.warn('[DB] Failed to log call, but call was initiated successfully:', dbError);
      }

      return NextResponse.json({
        success: true,
        call_sid: call.sid,
        status: call.status,
        message: `Call initiated to ${to_number}`,
      });

    } catch (twilioError: any) {
      console.error('[Twilio] API error:', twilioError);
      return NextResponse.json(
        {
          error: 'Failed to initiate call via Twilio',
          details: twilioError.message || twilioError.toString(),
          code: twilioError.code,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Call initiation] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
