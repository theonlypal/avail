/**
 * GET /api/calls/transcripts?call_sid=xxx
 *
 * Polling endpoint for getting real-time transcription updates
 * Frontend polls this every 1-2 seconds during active calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Initialize database connection
const sql = IS_PRODUCTION && postgresUrl ? neon(postgresUrl) : null;

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
    if (!sql) {
      return NextResponse.json({
        success: true,
        transcripts: [],
        message: 'Database not configured - demo mode'
      });
    }

    // Query database for transcripts
    let transcripts;
    if (lastId) {
      // Get only transcripts after lastId (lastId is timestamp)
      transcripts = await sql`
        SELECT call_sid, speaker, text, timestamp, confidence
        FROM live_transcripts
        WHERE call_sid = ${callSid}
        AND timestamp > ${lastId}
        ORDER BY timestamp ASC
      `;
    } else {
      // Get all transcripts for this call
      transcripts = await sql`
        SELECT call_sid, speaker, text, timestamp, confidence
        FROM live_transcripts
        WHERE call_sid = ${callSid}
        ORDER BY timestamp ASC
      `;
    }

    // Map speaker labels to match frontend expectations
    const formattedTranscripts = transcripts.map((t: any) => ({
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
    if (sql) {
      // Delete transcripts from database
      await sql`
        DELETE FROM live_transcripts
        WHERE call_sid = ${callSid}
      `;
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
