/**
 * API Route: Initiate outbound call via Twilio
 * POST /api/calls/initiate
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface InitiateCallRequest {
  lead_id: string;
  to_number: string;
}

/**
 * POST /api/calls/initiate - Start an outbound call
 */
export async function POST(request: Request) {
  try {
    const body: InitiateCallRequest = await request.json();
    const { lead_id, to_number } = body;

    if (!lead_id || !to_number) {
      return NextResponse.json(
        { error: 'lead_id and to_number are required' },
        { status: 400 }
      );
    }

    // Check for Twilio credentials
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      // Return demo mode response if Twilio not configured
      console.warn('Twilio credentials not configured - running in demo mode');

      return NextResponse.json({
        success: true,
        demo_mode: true,
        call_sid: `demo-${Date.now()}`,
        status: 'initiated',
        message: 'Demo mode: Twilio not configured. Call simulated.',
      });
    }

    // TODO: Implement actual Twilio call initiation
    // This will be implemented when Twilio SDK is added

    /*
    const twilio = require('twilio');
    const client = twilio(twilioAccountSid, twilioAuthToken);

    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to: to_number,
      from: twilioPhoneNumber,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: true,
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/recording`,
    });

    return NextResponse.json({
      success: true,
      call_sid: call.sid,
      status: call.status,
    });
    */

    // For now, return demo response
    return NextResponse.json({
      success: true,
      demo_mode: true,
      call_sid: `demo-${lead_id}-${Date.now()}`,
      status: 'initiated',
      message: 'Call initiated successfully (demo mode)',
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    );
  }
}
