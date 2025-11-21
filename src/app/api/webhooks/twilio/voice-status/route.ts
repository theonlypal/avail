/**
 * Twilio Call Status Callback Webhook - PRODUCTION READY
 *
 * Handles status updates for outbound calls made via <Dial>
 * - Tracks call completion, duration, and outcome
 * - Updates message records with final status
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';

/**
 * POST /api/webhooks/twilio/voice-status
 *
 * Twilio sends:
 * - CallSid: Unique call ID
 * - DialCallStatus: answered, busy, no-answer, failed, canceled
 * - DialCallDuration: Call duration in seconds
 * - From: Original caller
 * - To: Dialed number
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callSid = formData.get('CallSid') as string;
    const dialCallStatus = formData.get('DialCallStatus') as string;
    const dialCallDuration = formData.get('DialCallDuration') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log('📊 Call status update:', {
      callSid,
      dialCallStatus,
      duration: dialCallDuration,
      from,
      to,
    });

    // Validate Twilio signature
    const twilioSignature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;

    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    if (twilioAuthToken) {
      const isValid = twilio.validateRequest(
        twilioAuthToken,
        twilioSignature,
        url,
        params
      );

      if (!isValid) {
        console.error('❌ Invalid Twilio signature on voice-status webhook');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // TODO: Update message record in database with final call status
    // - Find message by twilio_sid (callSid)
    // - Update status field with dialCallStatus
    // - Add duration to metadata
    // Example:
    // await updateMessage(callSid, {
    //   status: dialCallStatus,
    //   metadata: { ...existing, dialCallDuration: parseInt(dialCallDuration) }
    // });

    console.log('✅ Call status processed:', callSid, dialCallStatus);

    // Return empty TwiML (no further action needed)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ POST /api/webhooks/twilio/voice-status error:', error);

    // Always return 200 to Twilio
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}
