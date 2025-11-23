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
 * 4. We store transcripts in database for real-time retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Store active Deepgram connections per call (in-process only)
const activeConnections = new Map<string, any>();

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
        // Initialize transcript storage in database
        await initializeTranscriptStorage(callSid);
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
 * Initialize transcript storage table for a call
 */
async function initializeTranscriptStorage(callSid: string) {
  try {
    // Create a temporary table to store live transcripts for this call
    // In production, you might use Redis or a similar fast store
    await db.run(`
      CREATE TABLE IF NOT EXISTS live_transcripts (
        call_sid TEXT NOT NULL,
        speaker TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (call_sid, timestamp)
      )
    `);

    console.log('[Database] Initialized live transcript storage for call:', callSid);
  } catch (error) {
    console.error('[Database] Failed to initialize transcript storage:', error);
  }
}

/**
 * Save a transcript entry to database
 */
async function saveTranscriptEntry(callSid: string, entry: any) {
  try {
    await db.run(`
      INSERT INTO live_transcripts (call_sid, speaker, text, timestamp, confidence)
      VALUES (?, ?, ?, ?, ?)
    `, [
      callSid,
      entry.speaker,
      entry.text,
      entry.timestamp,
      entry.confidence || 0.99
    ]);

    console.log(`[Database] Saved transcript: [${entry.speaker}] ${entry.text.substring(0, 50)}...`);
  } catch (error) {
    console.error('[Database] Failed to save transcript entry:', error);
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

    connection.on(LiveTranscriptionEvents.Transcript, async (data: any) => {
      const transcript = data.channel?.alternatives?.[0];
      if (transcript?.transcript) {
        const speaker = data.channel?.alternatives?.[0]?.words?.[0]?.speaker || 0;

        console.log(`[Deepgram] [Speaker ${speaker}]:`, transcript.transcript);

        // Save transcript entry to database immediately
        const entry = {
          speaker: speaker === 0 ? 'Agent' : 'Lead',
          text: transcript.transcript,
          timestamp: Date.now(),
          confidence: transcript.confidence,
        };

        await saveTranscriptEntry(callSid, entry);
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
 * GET handler to retrieve transcripts for a call from database
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

  try {
    // Retrieve transcripts from database
    const transcripts = await db.query(`
      SELECT speaker, text, timestamp, confidence
      FROM live_transcripts
      WHERE call_sid = ?
      ORDER BY timestamp ASC
    `, [callSid]);

    console.log(`[API] Retrieved ${transcripts.length} transcripts for call ${callSid}`);

    return NextResponse.json({
      callSid,
      transcript: transcripts,
      status: activeConnections.has(callSid) ? 'active' : 'completed',
    });
  } catch (error: any) {
    console.error('[API] Failed to retrieve transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcripts', details: error.message },
      { status: 500 }
    );
  }
}
