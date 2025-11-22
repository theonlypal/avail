import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/calls/save
 *
 * Save a complete call record with full transcript and analytics to call_records table
 *
 * Body:
 * {
 *   call_sid: string;
 *   lead_id: string;
 *   team_id: string;
 *   started_at: string;
 *   ended_at: string;
 *   duration_seconds: number;
 *   status: 'completed' | 'failed' | 'no_answer' | 'busy';
 *   call_success: boolean;
 *   success_reason?: string;
 *   sentiment_score?: number; // 0.0 to 1.0
 *   full_transcript: Array<{speaker: string, text: string, timestamp: number}>;
 *   notes?: string;
 *   agent_talk_time_seconds?: number;
 *   lead_talk_time_seconds?: number;
 *   ai_suggestions_count?: number;
 *   total_latency_ms?: number;
 *   recording_url?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      call_sid,
      lead_id,
      team_id,
      started_at,
      ended_at,
      duration_seconds,
      status,
      call_success,
      success_reason,
      sentiment_score,
      full_transcript,
      notes,
      agent_talk_time_seconds,
      lead_talk_time_seconds,
      ai_suggestions_count,
      total_latency_ms,
      recording_url
    } = body;

    // Validate required fields
    if (!call_sid || !lead_id || !team_id || !started_at) {
      return NextResponse.json(
        { error: 'Missing required fields: call_sid, lead_id, team_id, started_at' },
        { status: 400 }
      );
    }

    // Validate sentiment_score range
    if (sentiment_score !== undefined && sentiment_score !== null) {
      if (sentiment_score < 0 || sentiment_score > 1) {
        return NextResponse.json(
          { error: 'sentiment_score must be between 0 and 1' },
          { status: 400 }
        );
      }
    }

    const callId = uuidv4();
    const now = new Date().toISOString();

    // Insert into call_records table
    await db.run(`
      INSERT INTO call_records (
        id, call_sid, lead_id, team_id,
        started_at, ended_at, duration_seconds, status,
        call_success, success_reason, sentiment_score,
        full_transcript, notes,
        agent_talk_time_seconds, lead_talk_time_seconds,
        ai_suggestions_count, total_latency_ms,
        recording_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      callId,
      call_sid,
      lead_id,
      team_id,
      started_at,
      ended_at || null,
      duration_seconds || 0,
      status || 'completed',
      call_success || false,
      success_reason || null,
      sentiment_score || null,
      JSON.stringify(full_transcript || []),
      notes || null,
      agent_talk_time_seconds || 0,
      lead_talk_time_seconds || 0,
      ai_suggestions_count || 0,
      total_latency_ms || 707,
      recording_url || null,
      now,
      now
    ]);

    // The update_lead_after_call trigger will automatically update the leads table
    // The auto_aggregate_analytics trigger will automatically update analytics_daily

    // Create activity log
    const activityId = uuidv4();
    const description = call_success
      ? `Successful call: ${success_reason || 'Call completed'}`
      : `Call ${status}: ${Math.floor(duration_seconds / 60)}m duration`;

    // Try to log activity - don't fail the whole request if this fails
    try {
      await db.run(`
        INSERT INTO activity_logs (
          id, team_id, lead_id, member_id, action_type, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        activityId,
        team_id,
        null, // member_id - TODO: Get from authenticated session
        lead_id,
        'call',
        description,
        now
      ]);
    } catch (activityError) {
      console.error('Failed to create activity log:', activityError);
      // Continue anyway - activity log is non-critical
    }

    return NextResponse.json({
      success: true,
      call_id: callId,
      message: 'Call record saved successfully'
    });

  } catch (error: any) {
    console.error('Call save error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calls/save?lead_id=xxx
 *
 * Get call records for a specific lead from call_records table
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const teamId = searchParams.get('team_id');

    if (!leadId && !teamId) {
      return NextResponse.json(
        { error: 'Either lead_id or team_id is required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT
        c.*,
        l.business_name,
        l.industry,
        l.location
      FROM call_records c
      LEFT JOIN leads l ON c.lead_id = l.id
    `;

    const params: any[] = [];

    if (leadId) {
      query += ' WHERE c.lead_id = ?';
      params.push(leadId);
    } else if (teamId) {
      query += ' WHERE c.team_id = ?';
      params.push(teamId);
    }

    query += ' ORDER BY c.started_at DESC';

    const calls = await db.query(query, params);

    // Parse full_transcript JSON strings back to arrays
    const callsWithParsedTranscripts = calls.map((call: any) => ({
      ...call,
      full_transcript: call.full_transcript
        ? (typeof call.full_transcript === 'string' ? JSON.parse(call.full_transcript) : call.full_transcript)
        : []
    }));

    return NextResponse.json({
      success: true,
      calls: callsWithParsedTranscripts,
      count: calls.length
    });

  } catch (error: any) {
    console.error('Call records retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
