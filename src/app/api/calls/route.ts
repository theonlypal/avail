import { NextRequest, NextResponse } from 'next/server';
import { getDb, getDefaultTeamId } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/calls
 *
 * Save a call log to the database with full analytics
 *
 * Body:
 * {
 *   lead_id: string;
 *   duration: number;
 *   outcome: string;
 *   call_quality?: string;
 *   transcript?: string;
 *   notes?: string;
 *   next_actions?: string;
 *   started_at: string;
 *   ended_at: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lead_id,
      duration,
      outcome,
      call_quality,
      transcript,
      notes,
      next_actions,
      started_at,
      ended_at
    } = body;

    if (!lead_id) {
      return NextResponse.json(
        { error: 'lead_id is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const teamId = getDefaultTeamId();

    // Get the default member (TODO: Replace with actual authenticated user)
    const member = db.prepare(`
      SELECT id FROM team_members WHERE team_id = ? LIMIT 1
    `).get(teamId) as { id: string } | undefined;

    if (!member) {
      return NextResponse.json(
        { error: 'No team member found' },
        { status: 404 }
      );
    }

    // Calculate analytics from transcript if available
    let talkRatio = null;
    let aiSentiment = null;
    let keyMoments = null;
    let objectionsRaised = null;

    if (transcript) {
      try {
        const transcriptData = JSON.parse(transcript);
        if (Array.isArray(transcriptData) && transcriptData.length > 0) {
          // Calculate talk ratio (how much the lead spoke)
          const leadMessages = transcriptData.filter((t: any) => t.speaker === 'lead').length;
          talkRatio = leadMessages / transcriptData.length;

          // Basic sentiment analysis based on outcome
          if (outcome === 'meeting_scheduled' || outcome === 'connected') {
            aiSentiment = 'positive';
          } else if (outcome === 'not_interested' || outcome === 'failed') {
            aiSentiment = 'negative';
          } else {
            aiSentiment = 'neutral';
          }

          // Extract key moments (first and last exchanges)
          if (transcriptData.length >= 2) {
            keyMoments = JSON.stringify([
              transcriptData[0],
              transcriptData[transcriptData.length - 1]
            ]);
          }
        }
      } catch (e) {
        console.error('Error parsing transcript:', e);
      }
    }

    const callId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO call_logs (
        id, lead_id, member_id, status, direction, duration, outcome,
        call_quality, transcript, ai_sentiment, talk_ratio, key_moments,
        objections_raised, next_actions, notes,
        started_at, ended_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      callId,
      lead_id,
      member.id,
      'completed',
      'outbound',
      duration || 0,
      outcome || 'completed',
      call_quality || null,
      transcript || null,
      aiSentiment,
      talkRatio,
      keyMoments,
      objectionsRaised,
      next_actions || null,
      notes || null,
      started_at,
      ended_at,
      now,
      now
    );

    // Create activity log
    const activityId = uuidv4();
    const outcomeDescription = outcome === 'meeting_scheduled'
      ? 'Scheduled meeting'
      : outcome === 'connected'
      ? `Completed ${Math.floor(duration / 60)}m call`
      : `Call ${outcome}`;

    db.prepare(`
      INSERT INTO activity_logs (
        id, team_id, lead_id, member_id, action_type, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      activityId,
      teamId,
      lead_id,
      member.id,
      'call',
      outcomeDescription,
      now
    );

    return NextResponse.json({
      success: true,
      call_id: callId,
    });

  } catch (error) {
    console.error('Call logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calls?lead_id=xxx
 *
 * Get call history for a lead
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    if (!leadId) {
      return NextResponse.json(
        { error: 'lead_id is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    const calls = db.prepare(`
      SELECT
        c.*,
        m.name as member_name,
        m.email as member_email
      FROM call_logs c
      LEFT JOIN team_members m ON c.member_id = m.id
      WHERE c.lead_id = ?
      ORDER BY c.created_at DESC
    `).all(leadId);

    return NextResponse.json({
      success: true,
      calls,
    });

  } catch (error) {
    console.error('Call history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
