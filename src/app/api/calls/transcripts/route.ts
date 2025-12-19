/**
 * GET /api/calls/transcripts?call_sid=xxx
 *
 * Polling endpoint for getting real-time transcription updates
 * Frontend polls this every 1-2 seconds during active calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Initialize database connection
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

interface TranscriptLine {
  call_sid: string;
  speaker: 'Agent' | 'Lead';
  text: string;
  timestamp: string;
  confidence?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('call_sid');
  const lastId = searchParams.get('last_id'); // For incremental updates

  if (!callSid) {
    return NextResponse.json(
      { error: 'call_sid is required' },
      { status: 400 }
    );
  }

  try {
    if (!pgPool) {
      return NextResponse.json({
        success: true,
        transcripts: [],
        message: 'Database not configured - demo mode'
      });
    }

    // Query database for transcripts
    let result;
    if (lastId) {
      // Extract timestamp from composite ID (format: callsid_timestamp)
      const timestampStr = lastId.includes('_') ? lastId.split('_').pop() : lastId;
      const lastTimestamp = timestampStr ? parseInt(timestampStr, 10) : 0;

      result = await pgPool.query(
        `SELECT call_sid, speaker, text, timestamp, confidence
         FROM live_transcripts
         WHERE call_sid = $1
         AND timestamp > $2
         ORDER BY timestamp ASC`,
        [callSid, lastTimestamp]
      );
    } else {
      // Get all transcripts for this call
      result = await pgPool.query(
        `SELECT call_sid, speaker, text, timestamp, confidence
         FROM live_transcripts
         WHERE call_sid = $1
         ORDER BY timestamp ASC`,
        [callSid]
      );
    }

    // Map speaker labels to match frontend expectations
    const formattedTranscripts = result.rows.map((t: any) => ({
      id: `${t.call_sid}_${t.timestamp}`, // Create composite ID from primary key
      speaker: t.speaker === 'Agent' ? 'user' : 'lead',
      text: t.text,
      timestamp: new Date(parseInt(t.timestamp)).toISOString(),
      confidence: t.confidence,
    }));

    return NextResponse.json({
      success: true,
      transcripts: formattedTranscripts,
      has_more: false,
    });

  } catch (error) {
    console.error('[Transcripts API] Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calls/transcripts?call_sid=xxx
 *
 * Clear transcripts for a call (when call ends) - optional cleanup
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('call_sid');

  if (!callSid) {
    return NextResponse.json(
      { error: 'call_sid is required' },
      { status: 400 }
    );
  }

  try {
    if (pgPool) {
      // Delete transcripts from database
      await pgPool.query(
        'DELETE FROM live_transcripts WHERE call_sid = $1',
        [callSid]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transcripts cleared',
    });
  } catch (error) {
    console.error('[Transcripts API] Error clearing transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to clear transcripts' },
      { status: 500 }
    );
  }
}
