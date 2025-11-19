// @ts-nocheck
import { supabase } from "./supabaseClient";
import { getCurrentTeamId } from "./auth";
import type { Lead, LeadFilter, DbLead } from "@/types";
import { dbLeadToLead } from "@/types";

/**
 * Fetch leads with optional filters
 */
export async function fetchLeads(filter?: LeadFilter): Promise<Lead[]> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  let query = supabase
    .from("leads")
    .select(`
      *,
      lead_assignments (
        assigned_to,
        assigned_at
      )
    `)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  // Apply search filter
  if (filter?.search) {
    query = query.or(
      `business_name.ilike.%${filter.search}%,industry.ilike.%${filter.search}%,location.ilike.%${filter.search}%`
    );
  }

  // Apply industry filter
  if (filter?.industries && filter.industries.length > 0) {
    query = query.in("industry", filter.industries);
  }

  // Apply score range filter
  if (filter?.scoreRange) {
    query = query
      .gte("opportunity_score", filter.scoreRange[0])
      .lte("opportunity_score", filter.scoreRange[1]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }

  // Filter by assigned_to if specified
  let leads = data as unknown as (DbLead & { lead_assignments: { assigned_to: string | null }[] })[];

  if (filter?.assignedTo && filter.assignedTo.length > 0) {
    leads = leads.filter((lead) => {
      const assignment = lead.lead_assignments?.[0];
      return assignment?.assigned_to && filter.assignedTo?.includes(assignment.assigned_to);
    });
  }

  // Convert to Lead type (helper function imported from types)
  return leads.map((dbLead) => {
    const { lead_assignments, ...leadData } = dbLead;
    const lead = dbLeadToLead(leadData as DbLead);
    // Add owner from lead_assignments if present
    if (lead_assignments && lead_assignments.length > 0) {
      lead.owner = lead_assignments[0].assigned_to;
    }
    return lead;
  });
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("team_id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching lead:", error);
    throw error;
  }

  return dbLeadToLead(data);
}

/**
 * Create a new lead
 */
export async function createLead(
  lead: Omit<Lead, "id" | "created_at" | "team_id">
): Promise<Lead> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  // Generate lead ID
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const { data, error } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      team_id: teamId,
      business_name: lead.business_name,
      industry: lead.industry,
      location: lead.location,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      rating: lead.rating,
      review_count: lead.review_count,
      website_score: lead.website_score,
      social_presence: lead.social_presence,
      ad_presence: lead.ad_presence,
      opportunity_score: lead.opportunity_score,
      pain_points: lead.pain_points,
      recommended_services: lead.recommended_services,
      ai_summary: lead.ai_summary,
      lat: lead.lat,
      lng: lead.lng,
      added_by: lead.added_by,
      source: lead.source || "manual",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating lead:", error);
    throw error;
  }

  return dbLeadToLead(data);
}

/**
 * Update a lead
 */
export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "created_at" | "team_id">>
): Promise<Lead> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .eq("team_id", teamId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lead:", error);
    throw error;
  }

  return dbLeadToLead(data);
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<void> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("team_id", teamId);

  if (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

/**
 * Get industry breakdown for the current team
 */
export async function getIndustryBreakdown(): Promise<Record<string, number>> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("industry")
    .eq("team_id", teamId);

  if (error) {
    console.error("Error fetching industry breakdown:", error);
    throw error;
  }

  // Count industries
  const breakdown: Record<string, number> = {};
  data.forEach((lead) => {
    breakdown[lead.industry] = (breakdown[lead.industry] || 0) + 1;
  });

  return breakdown;
}

/**
 * Get aggregate stats for the current team
 */
export async function getLeadStats() {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("opportunity_score, rating, review_count")
    .eq("team_id", teamId);

  if (error) {
    console.error("Error fetching lead stats:", error);
    throw error;
  }

  const totalLeads = data.length;
  const avgScore = data.reduce((sum, lead) => sum + lead.opportunity_score, 0) / totalLeads || 0;
  const avgRating = data.reduce((sum, lead) => sum + lead.rating, 0) / totalLeads || 0;
  const totalReviews = data.reduce((sum, lead) => sum + lead.review_count, 0);

  return {
    totalLeads,
    avgScore: Math.round(avgScore),
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews,
  };
}

/**
 * Search leads using external APIs (Google Maps, Yelp) and save to database
 */
export async function searchAndImportLeads(
  industry: string,
  location: string,
  limit = 20
): Promise<Lead[]> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  // Call the search API
  const response = await fetch("/api/leads/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ industry, city: location, limit }),
  });

  if (!response.ok) {
    throw new Error("Failed to search leads");
  }

  const result = await response.json();

  // If we got results from external APIs, import them
  if (result.source === "live" && result.leads) {
    const importedLeads: Lead[] = [];

    for (const leadData of result.leads) {
      try {
        const lead = await createLead(leadData);
        importedLeads.push(lead);
      } catch (error) {
        console.error("Error importing lead:", error);
      }
    }

    return importedLeads;
  }

  return [];
}
