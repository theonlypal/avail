import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test live_transcripts table connection
 * GET /api/debug-transcripts?callSid=xxx
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
    console.log('[Debug] Querying for callSid:', callSid);

    // Try to query the live_transcripts table
    const transcripts = await db.query(`
      SELECT speaker, text, timestamp, confidence
      FROM live_transcripts
      WHERE call_sid = ?
      ORDER BY timestamp ASC
    `, [callSid]);

    console.log('[Debug] Found transcripts:', transcripts.length);

    return NextResponse.json({
      success: true,
      callSid,
      count: transcripts.length,
      transcripts,
      environment: {
        isProduction: db.isProduction,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    });
  } catch (error: any) {
    console.error('[Debug] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        environment: {
          isProduction: db.isProduction,
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        }
      },
      { status: 500 }
    );
  }
}
