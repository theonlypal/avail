import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calls/twiml
 *
 * Returns TwiML instructions for Twilio calls with Media Streams
 * This enables real-time audio streaming for transcription
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get call SID from query params if available
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('CallSid');

  // Build WebSocket URL for Media Streams
  // Note: In production on Vercel, use wss:// protocol
  const wsProtocol = appUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = appUrl.replace('https://', '').replace('http://', '');
  const streamUrl = `${wsProtocol}://${wsHost}/api/calls/stream`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${streamUrl}">
      <Parameter name="callSid" value="${callSid || ''}" />
    </Stream>
  </Start>
  <Say voice="alice">You are now connected. The call is being transcribed in real-time.</Say>
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
