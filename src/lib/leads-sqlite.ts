/**
 * Lead operations using dual-mode database (SQLite dev, Neon production)
 * Works seamlessly in both development and production
 */

import { db } from './db';
import type { Lead, LeadFilter } from '@/types';

/**
 * Helper to get first team ID
 */
async function getFirstTeamId(): Promise<string> {
  const teams = await db.query('SELECT id FROM teams LIMIT 1');
  if (!teams || teams.length === 0) {
    throw new Error('No team found in database');
  }
  return teams[0].id;
}

/**
 * Fetch leads with optional filters
 */
export async function fetchLeads(filter?: LeadFilter): Promise<Lead[]> {
  try {
    const teamId = await getFirstTeamId();

    let query = `
      SELECT l.*
      FROM leads l
      WHERE l.team_id = ?
    `;

    const params: any[] = [teamId];

    // Apply search filter
    if (filter?.search) {
      query += ` AND (
        l.business_name LIKE ? OR
        l.industry LIKE ? OR
        l.location LIKE ?
      )`;
      const searchTerm = `%${filter.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Apply industry filter
    if (filter?.industries && filter.industries.length > 0) {
      const placeholders = filter.industries.map(() => '?').join(',');
      query += ` AND l.industry IN (${placeholders})`;
      params.push(...filter.industries);
    }

    // Apply score range filter
    if (filter?.scoreRange) {
      query += ` AND l.opportunity_score >= ? AND l.opportunity_score <= ?`;
      params.push(filter.scoreRange[0], filter.scoreRange[1]);
    }

    query += ` ORDER BY l.opportunity_score DESC, l.created_at DESC`;

    const rows = await db.query(query, params);

    return rows.map((row: any) => ({
      id: row.id,
      business_name: row.business_name,
      industry: row.industry,
      location: row.location,
      phone: row.phone,
      email: row.email,
      website: row.website,
      rating: row.rating,
      review_count: row.review_count,
      website_score: row.website_score,
      social_presence: row.social_presence,
      ad_presence: Boolean(row.ad_presence),
      opportunity_score: row.opportunity_score,
      pain_points: row.pain_points ? JSON.parse(row.pain_points) : [],
      recommended_services: row.recommended_services ? JSON.parse(row.recommended_services) : [],
      ai_summary: row.ai_summary,
      lat: row.lat,
      lng: row.lng,
      added_by: row.added_by,
      created_at: row.created_at,
      team_id: row.team_id,
      source: row.source,
      enriched_at: row.enriched_at,
      scored_at: row.scored_at,
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const teamId = await getFirstTeamId();

    const row = await db.get(`
      SELECT * FROM leads
      WHERE id = ? AND team_id = ?
    `, [id, teamId]);

    if (!row) return null;

    return {
      id: row.id,
      business_name: row.business_name,
      industry: row.industry,
      location: row.location,
      phone: row.phone,
      email: row.email,
      website: row.website,
      rating: row.rating,
      review_count: row.review_count,
      website_score: row.website_score,
      social_presence: row.social_presence,
      ad_presence: Boolean(row.ad_presence),
      opportunity_score: row.opportunity_score,
      pain_points: row.pain_points ? JSON.parse(row.pain_points) : [],
      recommended_services: row.recommended_services ? JSON.parse(row.recommended_services) : [],
      ai_summary: row.ai_summary,
      lat: row.lat,
      lng: row.lng,
      added_by: row.added_by,
      created_at: row.created_at,
      team_id: row.team_id,
      source: row.source,
      enriched_at: row.enriched_at,
      scored_at: row.scored_at,
    };
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}

/**
 * Create a new lead
 */
export async function createLead(
  lead: Omit<Lead, "id" | "created_at" | "team_id">
): Promise<Lead> {
  try {
    const teamId = await getFirstTeamId();
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    await db.run(`
      INSERT INTO leads (
        id, team_id, business_name, industry, location,
        phone, email, website, rating, review_count,
        website_score, social_presence, ad_presence,
        opportunity_score, pain_points, recommended_services,
        ai_summary, lat, lng, added_by, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      leadId,
      teamId,
      lead.business_name,
      lead.industry,
      lead.location,
      lead.phone,
      lead.email,
      lead.website,
      lead.rating,
      lead.review_count,
      lead.website_score,
      lead.social_presence,
      lead.ad_presence ? 1 : 0,
      lead.opportunity_score,
      JSON.stringify(lead.pain_points),
      JSON.stringify(lead.recommended_services),
      lead.ai_summary,
      lead.lat,
      lead.lng,
      lead.added_by,
      lead.source || 'manual'
    ]);

    const newLead = await getLeadById(leadId);
    if (!newLead) {
      throw new Error('Failed to create lead');
    }
    return newLead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

/**
 * Update a lead
 */
export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "created_at" | "team_id">>
): Promise<Lead> {
  try {
    const teamId = await getFirstTeamId();

    const setClause: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'pain_points' || key === 'recommended_services') {
        setClause.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else if (key === 'ad_presence') {
        setClause.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setClause.length > 0) {
      await db.run(`
        UPDATE leads
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND team_id = ?
      `, [...values, id, teamId]);
    }

    const updatedLead = await getLeadById(id);
    if (!updatedLead) {
      throw new Error('Lead not found');
    }
    return updatedLead;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<void> {
  try {
    const teamId = await getFirstTeamId();

    await db.run(`
      DELETE FROM leads
      WHERE id = ? AND team_id = ?
    `, [id, teamId]);
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

/**
 * Get industry breakdown
 */
export async function getIndustryBreakdown(): Promise<Record<string, number>> {
  try {
    const teamId = await getFirstTeamId();

    const rows = await db.query(`
      SELECT industry, COUNT(*) as count
      FROM leads
      WHERE team_id = ?
      GROUP BY industry
      ORDER BY count DESC
    `, [teamId]);

    const breakdown: Record<string, number> = {};
    rows.forEach((row: any) => {
      breakdown[row.industry] = Number(row.count);
    });

    return breakdown;
  } catch (error) {
    console.error('Error fetching industry breakdown:', error);
    throw error;
  }
}

/**
 * Get aggregate stats
 */
export async function getLeadStats() {
  try {
    const teamId = await getFirstTeamId();

    const stats = await db.get(`
      SELECT
        COUNT(*) as totalLeads,
        AVG(opportunity_score) as avgScore,
        AVG(rating) as avgRating,
        SUM(review_count) as totalReviews
      FROM leads
      WHERE team_id = ?
    `, [teamId]);

    return {
      totalLeads: Number(stats.totalLeads) || 0,
      avgScore: Math.round(Number(stats.avgScore) || 0),
      avgRating: parseFloat((Number(stats.avgRating) || 0).toFixed(1)),
      totalReviews: Number(stats.totalReviews) || 0,
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    throw error;
  }
}
