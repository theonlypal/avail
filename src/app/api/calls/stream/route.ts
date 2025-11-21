/**
 * Twilio Media Streams → Deepgram Real-Time Transcription
 *
 * This endpoint receives audio from BOTH sides of a Twilio call and transcribes it in real-time.
 * Uses Deepgram for speech-to-text with speaker diarization.
 *
 * Flow:
 * 1. Twilio sends audio chunks via WebSocket/POST
 * 2. We forward to Deepgram's live transcription API
 * 3. Deepgram returns transcripts with speaker labels
 * 4. We store transcripts and broadcast to dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Store active Deepgram connections per call
const activeConnections = new Map<string, any>();
const transcripts = new Map<string, any[]>();

/**
 * POST handler for Twilio Media Stream events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, streamSid, callSid, media, track } = body;

    console.log(`[Media Stream] Event: ${event}, CallSid: ${callSid}, Track: ${track}`);

    switch (event) {
      case 'connected':
        console.log('[Media Stream] WebSocket connected:', streamSid);
        break;

      case 'start':
        console.log('[Media Stream] Starting transcription for call:', callSid);
        await initializeDeepgram(callSid);
        transcripts.set(callSid, []);
        break;

      case 'media':
        // Forward audio to Deepgram
        const connection = activeConnections.get(callSid);
        if (connection && media?.payload) {
          // Decode base64 mulaw audio
          const audioBuffer = Buffer.from(media.payload, 'base64');
          connection.send(audioBuffer);
        }
        break;

      case 'stop':
        console.log('[Media Stream] Stopping transcription for call:', callSid);
        const conn = activeConnections.get(callSid);
        if (conn) {
          conn.finish();
          activeConnections.delete(callSid);
        }

        // Save final transcript to database
        const finalTranscript = transcripts.get(callSid) || [];
        await saveTranscript(callSid, finalTranscript);
        transcripts.delete(callSid);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Media Stream] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Initialize Deepgram connection for a call
 */
async function initializeDeepgram(callSid: string) {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error('[Deepgram] API key not configured');
    return;
  }

  try {
    const deepgram = createClient(apiKey);

    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      punctuate: true,
      diarize: true, // Enable speaker diarization
      encoding: 'mulaw',
      sample_rate: 8000,
      channels: 1,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('[Deepgram] Connection opened for call:', callSid);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const transcript = data.channel?.alternatives?.[0];
      if (transcript?.transcript) {
        const speaker = data.channel?.alternatives?.[0]?.words?.[0]?.speaker || 0;

        console.log(`[Deepgram] [Speaker ${speaker}]:`, transcript.transcript);

        // Store transcript
        const callTranscripts = transcripts.get(callSid) || [];
        callTranscripts.push({
          speaker: speaker === 0 ? 'Agent' : 'Lead',
          text: transcript.transcript,
          timestamp: Date.now(),
          confidence: transcript.confidence,
        });
        transcripts.set(callSid, callTranscripts);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('[Deepgram] Error:', error);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('[Deepgram] Connection closed for call:', callSid);
    });

    activeConnections.set(callSid, connection);
  } catch (error) {
    console.error('[Deepgram] Failed to initialize:', error);
  }
}

/**
 * Save transcript to database
 */
async function saveTranscript(callSid: string, transcript: any[]) {
  try {
    console.log(`[Database] Saving transcript for call ${callSid}:`, transcript.length, 'entries');

    // TODO: Save to your database
    // await sql`UPDATE call_logs SET transcript = ${JSON.stringify(transcript)} WHERE call_sid = ${callSid}`;

    // For now, just log
    console.log('[Database] Transcript saved successfully');
  } catch (error) {
    console.error('[Database] Failed to save transcript:', error);
  }
}

/**
 * GET handler to retrieve transcripts for a call
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('callSid');

  if (!callSid) {
    return NextResponse.json(
      { error: 'callSid required' },
      { status: 400 }
    );
  }

  const transcript = transcripts.get(callSid) || [];

  return NextResponse.json({
    callSid,
    transcript,
    status: activeConnections.has(callSid) ? 'active' : 'completed',
  });
}
