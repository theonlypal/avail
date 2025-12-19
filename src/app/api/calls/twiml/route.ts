import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calls/twiml
 *
 * Returns TwiML instructions for Twilio calls with REAL-TIME transcription
 * Uses WebSocket streaming to custom server with Deepgram integration
 */
export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('railway.app') || host.includes('vercel.app') ? 'https' : 'http';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('CallSid') || 'unknown';

  // WebSocket URL for media streaming
  const wsProtocol = appUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = appUrl.replace('https://', '').replace('http://', '');
  const streamUrl = `${wsProtocol}://${wsHost}/api/calls/stream`;

  // TwiML with WebSocket streaming to custom server
  // CRITICAL: Use track="both_tracks" to capture BOTH speakers (Lead + Agent/Web User)
  // Channel 0 = Lead (inbound), Channel 1 = Agent/Web User (outbound)
  // This enables AI Coach to see BOTH transcripts in real-time for coaching
  // <Pause> keeps the call alive for up to 1 hour
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This call is now being recorded and transcribed in real time. Please speak now.</Say>
  <Start>
    <Stream url="${streamUrl}" track="both_tracks">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Start>
  <Pause length="3600"/>
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
