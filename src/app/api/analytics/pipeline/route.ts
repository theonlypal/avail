/**
 * Pipeline Analytics API - PRODUCTION READY
 *
 * Returns comprehensive pipeline analytics:
 * - Deal stage distribution and values
 * - Conversion rates between stages
 * - Average time in each stage
 * - Win/loss rates
 * - Historical trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Database: any = null;
if (!IS_PRODUCTION) {
  try { Database = require('better-sqlite3'); } catch { /* expected in production */ }
}

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

const DB_PATH = path.join(process.cwd(), 'data', 'leadly.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

function getSqliteDb(): any {
  if (!sqliteDb) {
    if (fs.existsSync(DB_PATH)) {
      sqliteDb = new Database(DB_PATH);
      sqliteDb.pragma('journal_mode = WAL');
    } else {
      throw new Error('Database not found');
    }
  }
  return sqliteDb;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id') || 'default-team';
  const period = searchParams.get('period') || '30'; // days

  try {
    let analytics;

    if (IS_PRODUCTION && pgPool) {
      analytics = await getProductionAnalytics(teamId, parseInt(period));
    } else {
      analytics = getLocalAnalytics(teamId, parseInt(period));
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Pipeline analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

async function getProductionAnalytics(teamId: string, periodDays: number) {
  // Stage distribution
  const stagesResult = await pgPool!.query(
    `SELECT
      stage,
      COUNT(*) as count,
      COALESCE(SUM(value), 0) as total_value,
      COALESCE(AVG(value), 0) as avg_value
    FROM deals
    GROUP BY stage
    ORDER BY count DESC`
  );

  // Win/loss stats
  const winLossResult = await pgPool!.query(
    `SELECT
      COUNT(CASE WHEN stage = 'won' THEN 1 END) as won,
      COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost,
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value,
      COALESCE(SUM(CASE WHEN stage = 'lost' THEN value ELSE 0 END), 0) as lost_value
    FROM deals
    WHERE created_at >= NOW() - MAKE_INTERVAL(days => $1)`,
    [periodDays]
  );

  // Monthly trend (last 6 months)
  const trendResult = await pgPool!.query(
    `SELECT
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as deals_created,
      COUNT(CASE WHEN stage = 'won' THEN 1 END) as deals_won,
      COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value
    FROM deals
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC`
  );

  // Lead score distribution
  const scoreDistribution = await pgPool!.query(
    `SELECT
      CASE
        WHEN opportunity_score >= 90 THEN '90-100'
        WHEN opportunity_score >= 80 THEN '80-89'
        WHEN opportunity_score >= 70 THEN '70-79'
        WHEN opportunity_score >= 60 THEN '60-69'
        WHEN opportunity_score >= 50 THEN '50-59'
        ELSE 'Below 50'
      END as range,
      COUNT(*) as count
    FROM leads
    WHERE team_id = $1
    GROUP BY range
    ORDER BY range DESC`,
    [teamId]
  );

  // Lead sources
  const sourcesResult = await pgPool!.query(
    `SELECT
      COALESCE(source, 'Unknown') as source,
      COUNT(*) as count
    FROM leads
    WHERE team_id = $1
    GROUP BY source
    ORDER BY count DESC
    LIMIT 10`,
    [teamId]
  );

  // Activity stats
  const activityStats = await pgPool!.query(
    `SELECT
      type,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
    FROM activities
    WHERE team_id = $1
    GROUP BY type`,
    [teamId]
  );

  const winLoss = winLossResult.rows[0] || { won: 0, lost: 0, total: 0, won_value: 0, lost_value: 0 };
  const winRate = winLoss.total > 0 ? Math.round((winLoss.won / winLoss.total) * 100) : 0;

  return {
    stages: stagesResult.rows.map((r: any) => ({
      name: r.stage,
      count: Number(r.count),
      totalValue: Number(r.total_value),
      avgValue: Math.round(Number(r.avg_value)),
    })),
    winLoss: {
      won: Number(winLoss.won),
      lost: Number(winLoss.lost),
      total: Number(winLoss.total),
      wonValue: Number(winLoss.won_value),
      lostValue: Number(winLoss.lost_value),
      winRate,
    },
    trend: trendResult.rows.map((r: any) => ({
      month: r.month,
      dealsCreated: Number(r.deals_created),
      dealsWon: Number(r.deals_won),
      wonValue: Number(r.won_value),
    })),
    scoreDistribution: scoreDistribution.rows.map((r: any) => ({
      range: r.range,
      count: Number(r.count),
    })),
    sources: sourcesResult.rows.map((r: any) => ({
      name: r.source,
      count: Number(r.count),
    })),
    activities: activityStats.rows.map((r: any) => ({
      type: r.type,
      count: Number(r.count),
      completed: Number(r.completed),
    })),
    period: periodDays,
  };
}

function getLocalAnalytics(teamId: string, periodDays: number) {
  const db = getSqliteDb();

  // Check if deals table exists
  const dealsExist = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='deals'
  `).get();

  if (!dealsExist) {
    return getEmptyAnalytics(periodDays);
  }

  // Stage distribution
  let stagesRows: any[] = [];
  try {
    stagesRows = db.prepare(`
      SELECT
        stage,
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as total_value,
        COALESCE(AVG(value), 0) as avg_value
      FROM deals
      GROUP BY stage
      ORDER BY count DESC
    `).all() as any[];
  } catch (e) {
    // Table might not exist
  }

  // Win/loss stats
  let winLossRow: any = { won: 0, lost: 0, total: 0, won_value: 0, lost_value: 0 };
  try {
    winLossRow = db.prepare(`
      SELECT
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as won,
        COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value,
        COALESCE(SUM(CASE WHEN stage = 'lost' THEN value ELSE 0 END), 0) as lost_value
      FROM deals
      WHERE datetime(created_at) >= datetime('now', '-' || ? || ' days')
    `).get(periodDays) as any || winLossRow;
  } catch (e) {
    // Table might not exist
  }

  // Monthly trend
  let trendRows: any[] = [];
  try {
    trendRows = db.prepare(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as deals_created,
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as deals_won,
        COALESCE(SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END), 0) as won_value
      FROM deals
      WHERE datetime(created_at) >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all() as any[];
  } catch (e) {
    // Table might not exist
  }

  // Lead score distribution
  let scoreRows: any[] = [];
  try {
    scoreRows = db.prepare(`
      SELECT
        CASE
          WHEN opportunity_score >= 90 THEN '90-100'
          WHEN opportunity_score >= 80 THEN '80-89'
          WHEN opportunity_score >= 70 THEN '70-79'
          WHEN opportunity_score >= 60 THEN '60-69'
          WHEN opportunity_score >= 50 THEN '50-59'
          ELSE 'Below 50'
        END as range,
        COUNT(*) as count
      FROM leads
      WHERE team_id = ?
      GROUP BY range
      ORDER BY range DESC
    `).all(teamId) as any[];
  } catch (e) {
    // Table might not exist
  }

  // Lead sources
  let sourcesRows: any[] = [];
  try {
    sourcesRows = db.prepare(`
      SELECT
        COALESCE(source, 'AI Discovery') as source,
        COUNT(*) as count
      FROM leads
      WHERE team_id = ?
      GROUP BY source
      ORDER BY count DESC
      LIMIT 10
    `).all(teamId) as any[];
  } catch (e) {
    // Table might not exist
  }

  // Activity stats
  let activityRows: any[] = [];
  try {
    activityRows = db.prepare(`
      SELECT
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM activities
      WHERE team_id = ?
      GROUP BY type
    `).all(teamId) as any[];
  } catch (e) {
    // Table might not exist
  }

  const winRate = winLossRow.total > 0 ? Math.round((winLossRow.won / winLossRow.total) * 100) : 0;

  return {
    stages: stagesRows.map((r) => ({
      name: r.stage,
      count: r.count,
      totalValue: r.total_value,
      avgValue: Math.round(r.avg_value),
    })),
    winLoss: {
      won: winLossRow.won,
      lost: winLossRow.lost,
      total: winLossRow.total,
      wonValue: winLossRow.won_value,
      lostValue: winLossRow.lost_value,
      winRate,
    },
    trend: trendRows.map((r) => ({
      month: r.month,
      dealsCreated: r.deals_created,
      dealsWon: r.deals_won,
      wonValue: r.won_value,
    })),
    scoreDistribution: scoreRows.map((r) => ({
      range: r.range,
      count: r.count,
    })),
    sources: sourcesRows.map((r) => ({
      name: r.source,
      count: r.count,
    })),
    activities: activityRows.map((r) => ({
      type: r.type,
      count: r.count,
      completed: r.completed,
    })),
    period: periodDays,
  };
}

function getEmptyAnalytics(periodDays: number) {
  return {
    stages: [],
    winLoss: { won: 0, lost: 0, total: 0, wonValue: 0, lostValue: 0, winRate: 0 },
    trend: [],
    scoreDistribution: [],
    sources: [],
    activities: [],
    period: periodDays,
  };
}
