/**
 * GET /api/calls/transcripts?call_sid=xxx
 *
 * Polling endpoint for getting real-time transcription updates
 * Frontend polls this every 1-2 seconds during active calls
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory transcript store (use Redis in production)
const transcriptStore = new Map<string, TranscriptLine[]>();

interface TranscriptLine {
  id: string;
  speaker: 'user' | 'lead';
  text: string;
  timestamp: string;
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

  const transcripts = transcriptStore.get(callSid) || [];

  // If lastId provided, return only new transcripts
  if (lastId) {
    const lastIndex = transcripts.findIndex(t => t.id === lastId);
    const newTranscripts = lastIndex >= 0 ? transcripts.slice(lastIndex + 1) : [];

    return NextResponse.json({
      success: true,
      transcripts: newTranscripts,
      has_more: false,
    });
  }

  // Return all transcripts
  return NextResponse.json({
    success: true,
    transcripts,
  });
}

/**
 * POST /api/calls/transcripts
 *
 * Add a new transcript line (called by the transcription service or demo)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { call_sid, speaker, text } = body;

    if (!call_sid || !speaker || !text) {
      return NextResponse.json(
        { error: 'call_sid, speaker, and text are required' },
        { status: 400 }
      );
    }

    const transcriptLine: TranscriptLine = {
      id: `${Date.now()}-${Math.random()}`,
      speaker: speaker as 'user' | 'lead',
      text,
      timestamp: new Date().toISOString(),
    };

    const existing = transcriptStore.get(call_sid) || [];
    existing.push(transcriptLine);
    transcriptStore.set(call_sid, existing);

    // Auto-cleanup after 1 hour
    setTimeout(() => {
      transcriptStore.delete(call_sid);
    }, 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      transcript: transcriptLine,
    });

  } catch (error) {
    console.error('Transcript error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calls/transcripts?call_sid=xxx
 *
 * Clear transcripts for a call (when call ends)
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

  transcriptStore.delete(callSid);

  return NextResponse.json({
    success: true,
    message: 'Transcripts cleared',
  });
}
