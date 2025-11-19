import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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

    if (!callSid) {
      return NextResponse.json(
        { error: 'CallSid is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();

    // Update call log with status
    const updateQuery = `
      UPDATE call_logs
      SET status = ?, updated_at = ?, duration = COALESCE(?, duration),
          recording_url = COALESCE(?, recording_url),
          ended_at = CASE WHEN ? = 'completed' THEN ? ELSE ended_at END
      WHERE call_sid = ?
    `;

    db.prepare(updateQuery).run(
      callStatus,
      now,
      callDuration ? parseInt(callDuration, 10) : null,
      recordingUrl || null,
      callStatus,
      callStatus === 'completed' ? now : null,
      callSid
    );

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
