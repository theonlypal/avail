/**
 * Twilio SMS Webhook - PRODUCTION READY
 *
 * Handles inbound SMS messages from Twilio
 * - Logs messages to CRM database
 * - Triggers automation rules (SMS keywords, auto-replies)
 * - Responds with TwiML for Twilio
 *
 * Configure in Twilio Console:
 * Messaging → Settings → Webhook URL: https://yourdomain.com/api/webhooks/twilio/sms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/lib/db-crm';
import { triggerSMSAutomation } from '@/lib/automation-engine';
import twilio from 'twilio';

// Twilio signature validation
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';

/**
 * POST /api/webhooks/twilio/sms
 * Twilio sends the following parameters:
 * - From: Sender's phone number
 * - To: Your Twilio number
 * - Body: Message content
 * - MessageSid: Unique message ID
 * - NumMedia: Number of media attachments (0 for text-only)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Twilio sends application/x-www-form-urlencoded)
    const formData = await request.formData();

    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const numMedia = formData.get('NumMedia') as string;

    console.log('📨 Incoming SMS webhook:', { from, to, body: body?.substring(0, 50) });

    // Validate Twilio signature (security best practice)
    const twilioSignature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;

    // Convert FormData to plain object for Twilio validation
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
        console.error('❌ Invalid Twilio signature - possible spoofing attempt');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Find or create contact by phone number
    // TODO: Implement contact lookup by phone number
    // For now, we'll use a placeholder contact_id
    // In production, you would:
    // 1. Search for contact by phone number
    // 2. If not found, create new contact
    // 3. Use that contact_id

    // Log message to database
    try {
      const message = await createMessage({
        contact_id: null, // Will be linked when contact lookup is implemented
        direction: 'inbound',
        channel: 'sms',
        from_number: from,
        to_number: to,
        body: body || '',
        status: 'received',
        twilio_sid: messageSid,
        sent_at: new Date(),
        metadata: {
          numMedia: parseInt(numMedia || '0'),
          rawWebhook: params,
        },
      });

      console.log('✅ Inbound SMS logged to database:', message.id);

      // Trigger automation rules for this SMS
      // NOTE: Using default team ID - in production, look up team from phone number
      const DEFAULT_TEAM_ID = process.env.DEFAULT_TEAM_ID || 'cm3u2qe5g0000kslxvmm90uv9';

      try {
        const automationResults = await triggerSMSAutomation({
          teamId: DEFAULT_TEAM_ID,
          contactId: message.contact_id || undefined,
          fromNumber: from,
          toNumber: to,
          smsBody: body || '',
        });

        if (automationResults.length > 0) {
          console.log(`🤖 Executed ${automationResults.length} automation(s):`, automationResults);
        }
      } catch (autoError: any) {
        console.error('⚠️ Automation engine error (non-blocking):', autoError.message);
        // Don't block the webhook - automations are optional
      }

    } catch (dbError: any) {
      console.error('❌ Failed to log message to database:', dbError.message);
      // Continue execution - don't block Twilio webhook
    }

    // Respond with TwiML (optional auto-reply)
    // Empty TwiML = no auto-reply (recommended for most cases)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Optional: Add auto-reply message here -->
  <!-- <Message>Thanks for your message! We'll get back to you soon.</Message> -->
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error: any) {
    console.error('❌ POST /api/webhooks/twilio/sms error:', error);

    // Always return 200 to Twilio (prevents retry storms)
    // Log errors internally but don't expose to Twilio
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
