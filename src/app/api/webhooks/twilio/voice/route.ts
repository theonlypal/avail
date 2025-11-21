/**
 * Twilio Voice Webhook - PRODUCTION READY
 *
 * Handles inbound voice calls from Twilio
 * - Provides IVR (Interactive Voice Response) menu
 * - Routes calls based on user input
 * - Records voicemails with transcription
 * - Logs all calls to CRM database
 *
 * Configure in Twilio Console:
 * Voice → Settings → Webhook URL: https://yourdomain.com/api/webhooks/twilio/voice
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/lib/db-crm';
import twilio from 'twilio';

// Twilio signature validation
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const businessPhoneNumber = process.env.BUSINESS_PHONE_NUMBER || '+1 (213) 555-0120';

/**
 * POST /api/webhooks/twilio/voice
 *
 * Twilio sends the following parameters:
 * - From: Caller's phone number
 * - To: Your Twilio number
 * - CallSid: Unique call ID
 * - CallStatus: initiated, ringing, in-progress, completed, etc.
 * - Digits: DTMF input from caller (if gathering input)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Twilio sends application/x-www-form-urlencoded)
    const formData = await request.formData();

    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const digits = formData.get('Digits') as string; // User's menu choice

    console.log('📞 Incoming voice webhook:', { from, to, callSid, callStatus, digits });

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

    // Log call to database
    try {
      await createMessage({
        contact_id: null, // Will be linked when contact lookup is implemented
        direction: 'inbound',
        channel: 'sms', // We use 'sms' channel for voice too, differentiated by metadata
        from_number: from,
        to_number: to,
        body: `Incoming voice call - Status: ${callStatus}${digits ? `, Menu choice: ${digits}` : ''}`,
        status: callStatus === 'completed' ? 'completed' : 'in-progress',
        twilio_sid: callSid,
        metadata: {
          callStatus,
          digits,
          type: 'voice',
          rawWebhook: params,
        },
        sent_at: new Date(),
      });

      console.log('✅ Inbound call logged to database:', callSid);

    } catch (dbError: any) {
      console.error('❌ Failed to log call to database:', dbError.message);
      // Continue execution - don't block Twilio webhook
    }

    // Generate TwiML response based on user input
    let twiml = '';

    if (digits) {
      // User selected a menu option
      switch (digits) {
        case '1':
          // Sales inquiries
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for your interest in our services. One moment while we connect you to our sales team.</Say>
  <Dial timeout="30" action="/api/webhooks/twilio/voice-status">
    ${businessPhoneNumber}
  </Dial>
  <Say voice="Polly.Joanna">Sorry, our team is currently unavailable. Please leave a message after the tone.</Say>
  <Record
    maxLength="120"
    transcribe="true"
    transcribeCallback="/api/webhooks/twilio/voicemail"
    playBeep="true"
  />
  <Say voice="Polly.Joanna">Thank you for your message. We'll call you back soon. Goodbye.</Say>
</Response>`;
          break;

        case '2':
          // Support inquiries
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for calling support. One moment please.</Say>
  <Dial timeout="30" action="/api/webhooks/twilio/voice-status">
    ${businessPhoneNumber}
  </Dial>
  <Say voice="Polly.Joanna">Sorry, our support team is currently unavailable. Please leave a message after the tone.</Say>
  <Record
    maxLength="120"
    transcribe="true"
    transcribeCallback="/api/webhooks/twilio/voicemail"
    playBeep="true"
  />
  <Say voice="Polly.Joanna">Thank you for your message. We'll call you back soon. Goodbye.</Say>
</Response>`;
          break;

        case '3':
          // Business hours
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Our business hours are Monday through Friday, 7 AM to 7 PM.
    Saturday 8 AM to 6 PM, and Sunday 9 AM to 5 PM.
    For emergencies, we're available 24/7.
    Press star to return to the main menu, or hang up to end the call.
  </Say>
  <Gather
    numDigits="1"
    action="/api/webhooks/twilio/voice"
    method="POST"
  >
    <Say voice="Polly.Joanna">Press star to return to the main menu.</Say>
  </Gather>
  <Say voice="Polly.Joanna">Goodbye.</Say>
</Response>`;
          break;

        case '*':
          // Return to main menu
          twiml = buildMainMenu();
          break;

        default:
          // Invalid selection
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Sorry, that's not a valid option.</Say>
  ${buildMainMenu()}
</Response>`;
      }

    } else {
      // First time caller - show main menu
      twiml = buildMainMenu();
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error: any) {
    console.error('❌ POST /api/webhooks/twilio/voice error:', error);

    // Always return 200 to Twilio (prevents retry storms)
    // Provide graceful error message to caller
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">We're sorry, but we're experiencing technical difficulties. Please try again later or visit our website.</Say>
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

/**
 * Build main IVR menu TwiML
 */
function buildMainMenu(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather
    numDigits="1"
    action="/api/webhooks/twilio/voice"
    method="POST"
    timeout="10"
  >
    <Say voice="Polly.Joanna">
      Thank you for calling.
      Press 1 for sales inquiries.
      Press 2 for customer support.
      Press 3 to hear our business hours.
      Or stay on the line to leave a voicemail.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna">No input received. Please leave a message after the tone.</Say>
  <Record
    maxLength="120"
    transcribe="true"
    transcribeCallback="/api/webhooks/twilio/voicemail"
    playBeep="true"
  />
  <Say voice="Polly.Joanna">Thank you for your message. We'll call you back soon. Goodbye.</Say>
</Response>`;
}
