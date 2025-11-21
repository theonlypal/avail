import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calls/twiml
 *
 * Returns TwiML instructions for Twilio calls with REAL-TIME dual transcription
 * Uses Twilio Media Streams to capture BOTH sides of conversation
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

  // Get call parameters
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('CallSid') || 'unknown';

  // Build WebSocket URL for Media Streams
  // We'll use wss:// in production for secure WebSocket connection
  const wsProtocol = appUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = appUrl.replace('https://', '').replace('http://', '');
  const streamUrl = `${wsProtocol}://${wsHost}/api/calls/stream`;

  // TwiML with Media Streams - captures audio from BOTH sides
  // The <Stream> tag sends real-time audio to our WebSocket endpoint
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${streamUrl}" track="both_tracks">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Start>
  <Say voice="alice">Connecting your call now. This call is being transcribed in real time.</Say>
  <Pause length="120"/>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
