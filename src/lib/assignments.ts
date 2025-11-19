// @ts-nocheck
import { supabase } from "./supabaseClient";
import { getCurrentTeamId } from "./auth";
import type { LeadAssignment } from "@/types";

/**
 * Get all assignments for the current team
 */
export async function getAssignmentsSnapshot(): Promise<LeadAssignment[]> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("lead_assignments")
    .select("*")
    .eq("team_id", teamId);

  if (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }

  return data as LeadAssignment[];
}

/**
 * Get assignment for a specific lead
 */
export async function getAssignmentByLeadId(
  leadId: string
): Promise<LeadAssignment | null> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("lead_assignments")
    .select("*")
    .eq("lead_id", leadId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching assignment:", error);
    throw error;
  }

  return data as LeadAssignment | null;
}

/**
 * Update or create an assignment
 */
export async function updateAssignment(
  leadId: string,
  userId: string
): Promise<LeadAssignment> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  // Check if assignment exists
  const existing = await getAssignmentByLeadId(leadId);

  if (existing) {
    // Update existing assignment
    const updateData = {
      assigned_to: userId,
      assigned_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("lead_assignments")
      .update(updateData as any)
      .eq("lead_id", leadId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) {
      console.error("Error updating assignment:", error);
      throw error;
    }

    return data as LeadAssignment;
  } else {
    // Create new assignment
    const { data, error } = await supabase
      .from("lead_assignments")
      .insert({
        team_id: teamId,
        lead_id: leadId,
        assigned_to: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assignment:", error);
      throw error;
    }

    return data as LeadAssignment;
  }
}

/**
 * Remove an assignment
 */
export async function removeAssignment(leadId: string): Promise<void> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { error } = await supabase
    .from("lead_assignments")
    .delete()
    .eq("lead_id", leadId)
    .eq("team_id", teamId);

  if (error) {
    console.error("Error removing assignment:", error);
    throw error;
  }
}

/**
 * Get all leads assigned to a specific team member
 */
export async function getLeadsByAssignee(
  assigneeId: string
): Promise<LeadAssignment[]> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const { data, error } = await supabase
    .from("lead_assignments")
    .select("*")
    .eq("team_id", teamId)
    .eq("assigned_to", assigneeId);

  if (error) {
    console.error("Error fetching assignments by assignee:", error);
    throw error;
  }

  return data as LeadAssignment[];
}

/**
 * Bulk assign leads to a team member
 */
export async function bulkAssignLeads(
  leadIds: string[],
  userId: string
): Promise<LeadAssignment[]> {
  const teamId = await getCurrentTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const assignments: LeadAssignment[] = [];

  for (const leadId of leadIds) {
    try {
      const assignment = await updateAssignment(leadId, userId);
      assignments.push(assignment);
    } catch (error) {
      console.error(`Error assigning lead ${leadId}:`, error);
    }
  }

  return assignments;
}
