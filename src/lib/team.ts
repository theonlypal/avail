/**
 * Team operations using SQLite database
 */

import { getDb, getDefaultTeamId } from './db';
import type { Team, TeamMember } from "@/types";

/**
 * Get the current user's team with members
 */
export async function getCurrentTeam(): Promise<Team | null> {
  const db = getDb();
  const teamId = getDefaultTeamId();

  if (!teamId) {
    return null;
  }

  try {
    const teamData = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as any;

    if (!teamData) {
      console.error("Team not found");
      return null;
    }

    const membersData = db.prepare('SELECT * FROM team_members WHERE team_id = ?').all(teamId) as any[];

    return {
      id: teamData.id,
      team_name: teamData.team_name,
      subscription_tier: teamData.subscription_tier,
      created_at: teamData.created_at,
      members: membersData as TeamMember[],
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

/**
 * Get all members of the current team
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const db = getDb();
  const teamId = getDefaultTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  try {
    const members = db.prepare('SELECT * FROM team_members WHERE team_id = ?').all(teamId) as TeamMember[];
    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
}

/**
 * Get a team member by ID
 */
export async function getTeamMemberById(
  memberId: string
): Promise<TeamMember | null> {
  const db = getDb();

  try {
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(memberId) as TeamMember | undefined;
    return member || null;
  } catch (error) {
    console.error("Error fetching team member:", error);
    throw error;
  }
}

/**
 * Invite a new team member (create pending member record)
 */
export async function inviteTeamMember(
  email: string,
  name: string,
  role: "owner" | "manager" | "rep" = "rep"
): Promise<TeamMember> {
  const db = getDb();
  const teamId = getDefaultTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    db.prepare(`
      INSERT INTO team_members (id, team_id, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(memberId, teamId, name, email, role);

    const newMember = await getTeamMemberById(memberId);

    if (!newMember) {
      throw new Error("Failed to create team member");
    }

    // TODO: Send invitation email

    return newMember;
  } catch (error) {
    console.error("Error inviting team member:", error);
    throw error;
  }
}

/**
 * Update a team member's role
 */
export async function updateTeamMemberRole(
  memberId: string,
  role: "owner" | "manager" | "rep"
): Promise<TeamMember> {
  const db = getDb();

  try {
    db.prepare('UPDATE team_members SET role = ? WHERE id = ?').run(role, memberId);

    const updatedMember = await getTeamMemberById(memberId);

    if (!updatedMember) {
      throw new Error("Team member not found");
    }

    return updatedMember;
  } catch (error) {
    console.error("Error updating team member role:", error);
    throw error;
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(memberId: string): Promise<void> {
  const db = getDb();

  try {
    db.prepare('DELETE FROM team_members WHERE id = ?').run(memberId);
  } catch (error) {
    console.error("Error removing team member:", error);
    throw error;
  }
}

/**
 * Get team performance stats
 */
export async function getTeamPerformance() {
  const db = getDb();
  const teamId = getDefaultTeamId();

  if (!teamId) {
    throw new Error("User not associated with a team");
  }

  const members = await getTeamMembers();

  const memberStats = members.map((member) => {
    // Get call logs count for this member
    const callCount = db.prepare('SELECT COUNT(*) as count FROM call_logs WHERE member_id = ?').get(member.id) as { count: number };

    return {
      member,
      assignedLeads: 0, // Not tracking assignments yet
      outreachSent: callCount.count || 0,
    };
  });

  return memberStats;
}
