import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/analytics?team_id=xxx&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 *
 * Get analytics data for a team within a date range
 *
 * Query params:
 * - team_id: Required - Team ID to get analytics for
 * - start_date: Optional - Start date (YYYY-MM-DD format), defaults to 30 days ago
 * - end_date: Optional - End date (YYYY-MM-DD format), defaults to today
 * - granularity: Optional - 'daily' (default) or 'summary'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');
    const granularity = searchParams.get('granularity') || 'daily';

    if (!teamId) {
      return NextResponse.json(
        { error: 'team_id is required' },
        { status: 400 }
      );
    }

    // Default to last 30 days if not specified
    const endDate = endDateParam || new Date().toISOString().split('T')[0];
    const startDate = startDateParam || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (granularity === 'daily') {
      // Get daily analytics breakdown
      const dailyAnalytics = await db.query(`
        SELECT
          date,
          leads_generated,
          leads_called,
          leads_converted,
          total_calls,
          successful_calls,
          failed_calls,
          no_answer_calls,
          avg_call_duration_seconds,
          total_call_time_seconds,
          avg_sentiment_score,
          avg_latency_ms,
          conversion_rate,
          created_at,
          updated_at
        FROM analytics_daily
        WHERE team_id = ?
          AND date >= ?
          AND date <= ?
        ORDER BY date DESC
      `, [teamId, startDate, endDate]);

      return NextResponse.json({
        success: true,
        granularity: 'daily',
        start_date: startDate,
        end_date: endDate,
        data: dailyAnalytics,
        count: dailyAnalytics.length
      });

    } else if (granularity === 'summary') {
      // Get aggregated summary for the entire period
      const summary = await db.get(`
        SELECT
          COUNT(DISTINCT date) as days_with_data,
          SUM(leads_generated) as total_leads_generated,
          SUM(leads_called) as total_leads_called,
          SUM(leads_converted) as total_leads_converted,
          SUM(total_calls) as total_calls,
          SUM(successful_calls) as total_successful_calls,
          SUM(failed_calls) as total_failed_calls,
          SUM(no_answer_calls) as total_no_answer_calls,
          AVG(avg_call_duration_seconds) as avg_call_duration_seconds,
          SUM(total_call_time_seconds) as total_call_time_seconds,
          AVG(avg_sentiment_score) as avg_sentiment_score,
          AVG(avg_latency_ms) as avg_latency_ms,
          AVG(conversion_rate) as avg_conversion_rate
        FROM analytics_daily
        WHERE team_id = ?
          AND date >= ?
          AND date <= ?
      `, [teamId, startDate, endDate]);

      // Calculate overall conversion rate
      const overallConversionRate = summary?.total_calls > 0
        ? (summary.total_successful_calls / summary.total_calls * 100).toFixed(2)
        : 0;

      return NextResponse.json({
        success: true,
        granularity: 'summary',
        start_date: startDate,
        end_date: endDate,
        data: {
          ...summary,
          overall_conversion_rate: overallConversionRate
        }
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid granularity. Use "daily" or "summary"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Analytics retrieval error:', error);
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
 * POST /api/analytics/refresh
 *
 * Manually trigger analytics aggregation for a specific date
 *
 * Body:
 * {
 *   team_id: string;
 *   date: string; // YYYY-MM-DD format, defaults to today
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, date } = body;

    if (!team_id) {
      return NextResponse.json(
        { error: 'team_id is required' },
        { status: 400 }
      );
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Call the aggregate_daily_analytics function
    // Note: In production (Postgres), we need to use the SELECT format to call functions
    if (db.isProduction) {
      await db.query(`
        SELECT aggregate_daily_analytics(?, ?)
      `, [team_id, targetDate]);
    } else {
      // SQLite doesn't have this function in dev - would need to implement aggregation logic
      return NextResponse.json(
        {
          error: 'Manual analytics refresh not supported in development mode',
          message: 'Use production environment for this feature'
        },
        { status: 501 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Analytics refreshed for ${targetDate}`,
      team_id,
      date: targetDate
    });

  } catch (error: any) {
    console.error('Analytics refresh error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
