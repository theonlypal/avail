import type { Database } from "./database";

// Export database row types for convenience
export type DbLead = Database["public"]["Tables"]["leads"]["Row"];
export type DbTeam = Database["public"]["Tables"]["teams"]["Row"];
export type DbTeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type DbLeadAssignment = Database["public"]["Tables"]["lead_assignments"]["Row"];
export type DbOutreachLog = Database["public"]["Tables"]["outreach_logs"]["Row"];
export type DbActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

// Application types (transformed from DB types for frontend use)
export type Lead = {
  id: string;
  business_name: string;
  industry: string;
  location: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  website_score: number;
  social_presence: string | null;
  ad_presence: boolean;
  opportunity_score: number;
  pain_points: string[];
  recommended_services: string[];
  ai_summary: string | null;
  lat: number | null;
  lng: number | null;
  added_by: string | null;
  created_at: string;
  team_id?: string;
  source?: string;
  enriched_at?: string | null;
  scored_at?: string | null;
  owner?: string | null; // Owner ID from lead_assignments
  verified?: number | null; // Verification status: 1 = verified, 0 = unverified
  verification_notes?: string | null;
  verification_date?: string | null;
};

export type OutreachStat = {
  id: string;
  lead_id: string;
  sent_by: string;
  channel: "email" | "sms";
  subject?: string | null;
  body: string;
  opened: boolean;
  responded: boolean;
  sent_at: string;
  created_at: string;
};

export type TeamMemberRole = "owner" | "manager" | "rep";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  team_id?: string;
  user_id?: string | null;
  avatar_url?: string | null;
};

export type Team = {
  id: string;
  team_name: string;
  subscription_tier: "starter" | "pro" | "enterprise";
  members: TeamMember[];
  created_at?: string;
};

export type LeadAssignment = {
  id?: string;
  team_id: string;
  lead_id: string;
  assigned_to?: string | null;
  assigned_at?: string;
};

// Helper to convert DB lead to app Lead type
export const dbLeadToLead = (dbLead: DbLead): Lead => {
  return {
    id: dbLead.id,
    business_name: dbLead.business_name,
    industry: dbLead.industry,
    location: dbLead.location,
    phone: dbLead.phone,
    email: dbLead.email,
    website: dbLead.website,
    rating: dbLead.rating,
    review_count: dbLead.review_count,
    website_score: dbLead.website_score,
    social_presence: dbLead.social_presence,
    ad_presence: dbLead.ad_presence,
    opportunity_score: dbLead.opportunity_score,
    pain_points: Array.isArray(dbLead.pain_points) ? dbLead.pain_points as string[] : [],
    recommended_services: Array.isArray(dbLead.recommended_services) ? dbLead.recommended_services as string[] : [],
    ai_summary: dbLead.ai_summary,
    lat: dbLead.lat,
    lng: dbLead.lng,
    added_by: dbLead.added_by,
    created_at: dbLead.created_at,
    team_id: dbLead.team_id,
    source: dbLead.source,
    enriched_at: dbLead.enriched_at,
    scored_at: dbLead.scored_at,
  };
}

export type LeadFilter = {
  search?: string;
  industries?: string[];
  industry?: string;
  scoreRange?: [number, number];
  assignedTo?: string[];
  verified?: string;
  hasWebsite?: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  loading?: boolean;
  action?: {
    name: string;
    args: Record<string, unknown>;
  };
};
