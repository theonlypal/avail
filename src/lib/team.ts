/**
 * Team operations using dual-mode database (SQLite dev, Neon production)
 */

import { db } from './db';
import type { Team, TeamMember } from "@/types";

/**
 * Get the current user's team with members
 */
export async function getCurrentTeam(): Promise<Team | null> {
  try {
    // Get first team
    const teams = await db.query('SELECT * FROM teams LIMIT 1');

    if (!teams || teams.length === 0) {
      console.error("No team found");
      return null;
    }

    const teamData = teams[0];
    const membersData = await db.query('SELECT * FROM team_members WHERE team_id = ?', [teamData.id]);

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
  try {
    // Get first team's ID
    const teams = await db.query('SELECT id FROM teams LIMIT 1');

    if (!teams || teams.length === 0) {
      throw new Error("No team found");
    }

    const teamId = teams[0].id;
    const members = await db.query('SELECT * FROM team_members WHERE team_id = ?', [teamId]);
    return members as TeamMember[];
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
  try {
    const member = await db.get('SELECT * FROM team_members WHERE id = ?', [memberId]);
    return (member as TeamMember) || null;
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
  try {
    // Get first team's ID
    const teams = await db.query('SELECT id FROM teams LIMIT 1');

    if (!teams || teams.length === 0) {
      throw new Error("No team found");
    }

    const teamId = teams[0].id;
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    await db.run(`
      INSERT INTO team_members (id, team_id, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `, [memberId, teamId, name, email, role]);

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
  try {
    await db.run('UPDATE team_members SET role = ? WHERE id = ?', [role, memberId]);

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
  try {
    await db.run('DELETE FROM team_members WHERE id = ?', [memberId]);
  } catch (error) {
    console.error("Error removing team member:", error);
    throw error;
  }
}

/**
 * Get team performance stats
 */
export async function getTeamPerformance() {
  try {
    const members = await getTeamMembers();

    const memberStats = await Promise.all(members.map(async (member) => {
      // Get call logs count for this member
      const callCountResult = await db.query('SELECT COUNT(*) as count FROM call_logs WHERE member_id = ?', [member.id]);
      const callCount = callCountResult[0]?.count || 0;

      return {
        member,
        assignedLeads: 0, // Not tracking assignments yet
        outreachSent: Number(callCount),
      };
    }));

    return memberStats;
  } catch (error) {
    console.error("Error fetching team performance:", error);
    throw error;
  }
}
