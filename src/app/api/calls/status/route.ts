import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/calls/status
 *
 * Twilio status callback endpoint
 * Updates call status in database as call progresses
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    // Get lead_id from query params (passed through statusCallback URL)
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id') || 'unknown';

    if (!callSid) {
      return NextResponse.json(
        { error: 'CallSid is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Map Twilio status to database status (DB constraint: 'active', 'completed', 'failed', 'no_answer', 'busy')
    const statusMap: Record<string, string> = {
      'initiated': 'active',
      'ringing': 'active',
      'in-progress': 'active',
      'answered': 'active',
      'completed': 'completed',
      'busy': 'busy',
      'no-answer': 'no_answer',
      'failed': 'failed',
      'canceled': 'failed'
    };
    const dbStatus = statusMap[callStatus] || 'active';

    // Insert or update call record (using call_records table for production)
    // Use INSERT...ON CONFLICT to handle case where row doesn't exist yet
    const upsertQuery = `
      INSERT INTO call_records (call_sid, lead_id, team_id, status, started_at, created_at, updated_at, duration_seconds, recording_url, ended_at)
      VALUES (?, ?, 'unknown', ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (call_sid) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at,
        duration_seconds = COALESCE(EXCLUDED.duration_seconds, call_records.duration_seconds),
        recording_url = COALESCE(EXCLUDED.recording_url, call_records.recording_url),
        ended_at = CASE WHEN EXCLUDED.status = 'completed' THEN EXCLUDED.ended_at ELSE call_records.ended_at END
    `;

    await db.run(upsertQuery, [
      callSid,
      leadId,
      dbStatus,
      now,
      now,
      now,
      callDuration ? parseInt(callDuration, 10) : null,
      recordingUrl || null,
      dbStatus === 'completed' ? now : null
    ]);

    console.log(`📞 Call ${callSid} status updated: ${callStatus}`);

    return NextResponse.json({
      success: true,
      message: `Call status updated to ${callStatus}`,
    });

  } catch (error) {
    console.error('Call status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
