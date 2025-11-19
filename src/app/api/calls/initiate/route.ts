import { NextRequest, NextResponse } from 'next/server';
import { getDb, getDefaultTeamId } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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

    const db = getDb();
    const teamId = getDefaultTeamId();

    // Get the default member (TODO: Replace with actual authenticated user)
    const member = db.prepare(`
      SELECT id FROM team_members WHERE team_id = ? LIMIT 1
    `).get(teamId) as { id: string } | undefined;

    if (!member) {
      return NextResponse.json(
        { error: 'No team member found' },
        { status: 404 }
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

    // Get app URL for callbacks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://leadly-g67af3asj-rayan-pals-projects.vercel.app';

    // REAL Twilio call - NO DEMO MODE
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);

      const call = await client.calls.create({
        to: to_number,
        from: twilioPhoneNumber,
        url: `${appUrl}/api/calls/twiml`,
        statusCallback: `${appUrl}/api/calls/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true,
      });

      // Create call log in database
      const callId = uuidv4();
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO call_logs (
          id, lead_id, member_id, call_sid, status, direction, started_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(callId, lead_id, member.id, call.sid, 'initiated', 'outbound', now, now);

      return NextResponse.json({
        success: true,
        call_id: callId,
        call_sid: call.sid,
        status: call.status,
      });

    } catch (twilioError) {
      console.error('Twilio API error:', twilioError);
      return NextResponse.json(
        { error: 'Failed to initiate call via Twilio', details: twilioError },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
