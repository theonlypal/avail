/**
 * WebSocket endpoint for Twilio Media Streams
 *
 * IMPORTANT NOTES:
 * 1. This route handles real-time audio streaming from Twilio
 * 2. Vercel has limited WebSocket support - for production, consider:
 *    - Using Vercel Edge Functions with streaming
 *    - Deploying a separate WebSocket server (e.g., on Railway, Render)
 *    - Using Pusher/Ably for real-time communication
 *
 * 3. For local development with ngrok, this will work
 * 4. Audio format: Twilio sends mulaw/8000 audio chunks
 * 5. You'll need a speech-to-text service (Deepgram, AssemblyAI, Google)
 */

import { NextRequest } from 'next/server';

// In-memory store for active connections
// In production, use Redis or a proper pub/sub system
const activeConnections = new Map<string, any>();

export const runtime = 'edge'; // Use edge runtime for better performance

/**
 * GET handler for WebSocket upgrade requests
 *
 * Note: This is a placeholder. For full WebSocket support:
 * 1. Deploy to a platform with native WebSocket support (Railway, Render, etc.)
 * 2. Or use Vercel with a client-side polling approach
 * 3. Or integrate with Pusher/Ably for managed real-time
 */
export async function GET(request: NextRequest) {
  const upgrade = request.headers.get('upgrade');

  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade request', { status: 426 });
  }

  // For demo/development: Return instructions
  return new Response(
    JSON.stringify({
      message: 'WebSocket endpoint ready',
      note: 'For production deployment, integrate with a speech-to-text service',
      recommended_services: [
        'Deepgram - Real-time speech-to-text',
        'AssemblyAI - Accurate transcription',
        'Google Speech-to-Text - Enterprise solution'
      ],
      integration_steps: [
        '1. Sign up for Deepgram (recommended for real-time)',
        '2. Add DEEPGRAM_API_KEY to environment variables',
        '3. Deploy to Vercel or a WebSocket-capable platform',
        '4. Update this endpoint to forward audio to Deepgram',
        '5. Broadcast transcripts to frontend clients'
      ]
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * POST handler for Twilio Media Stream events
 *
 * Twilio sends these event types:
 * - connected: Stream started
 * - start: Stream parameters
 * - media: Audio payload (base64 encoded mulaw/8000)
 * - stop: Stream ended
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, streamSid, callSid, media } = body;

    console.log(`[Media Stream] Event: ${event}, CallSid: ${callSid}`);

    switch (event) {
      case 'connected':
        console.log('[Media Stream] Connected:', streamSid);
        activeConnections.set(callSid, { streamSid, startTime: Date.now() });
        break;

      case 'start':
        console.log('[Media Stream] Stream started with params:', body);
        break;

      case 'media':
        // This is where audio chunks arrive
        // media.payload is base64-encoded mulaw audio
        // In production, send this to your speech-to-text service

        // Example: Forward to Deepgram
        // await forwardToDeepgram(callSid, media.payload);

        // For demo: Just log
        if (Math.random() < 0.01) { // Log 1% of chunks to avoid spam
          console.log(`[Media Stream] Received audio chunk for ${callSid}`);
        }
        break;

      case 'stop':
        console.log('[Media Stream] Stream stopped:', callSid);
        activeConnections.delete(callSid);
        break;

      default:
        console.log('[Media Stream] Unknown event:', event);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Media Stream] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Example integration with Deepgram (uncomment and configure)
 *
 * import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
 *
 * async function forwardToDeepgram(callSid: string, audioPayload: string) {
 *   const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');
 *
 *   const connection = deepgram.listen.live({
 *     model: 'nova-2',
 *     language: 'en-US',
 *     smart_format: true,
 *   });
 *
 *   connection.on(LiveTranscriptionEvents.Transcript, (data) => {
 *     const transcript = data.channel.alternatives[0].transcript;
 *     if (transcript) {
 *       // Broadcast to frontend via Server-Sent Events or polling
 *       broadcastTranscript(callSid, transcript);
 *     }
 *   });
 *
 *   // Send audio buffer
 *   const audioBuffer = Buffer.from(audioPayload, 'base64');
 *   connection.send(audioBuffer);
 * }
 *
 * function broadcastTranscript(callSid: string, transcript: string) {
 *   // Store in Redis or in-memory store
 *   // Frontend polls /api/calls/transcripts?call_sid=xxx
 * }
 */
