// Supabase Database Types
// Auto-generated types for type-safe database queries

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise'
export type TeamMemberRole = 'owner' | 'manager' | 'rep'
export type OutreachChannel = 'email' | 'sms'

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          team_name: string
          subscription_tier: SubscriptionTier
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_name: string
          subscription_tier?: SubscriptionTier
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_name?: string
          subscription_tier?: SubscriptionTier
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string | null
          name: string
          email: string
          role: TeamMemberRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string | null
          name: string
          email: string
          role?: TeamMemberRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string | null
          name?: string
          email?: string
          role?: TeamMemberRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          team_id: string
          business_name: string
          industry: string
          location: string
          phone: string | null
          email: string | null
          website: string | null
          rating: number
          review_count: number
          website_score: number
          social_presence: string | null
          ad_presence: boolean
          opportunity_score: number
          pain_points: Json
          recommended_services: Json
          ai_summary: string | null
          lat: number | null
          lng: number | null
          added_by: string | null
          source: string
          enriched_at: string | null
          scored_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          team_id: string
          business_name: string
          industry: string
          location: string
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number
          review_count?: number
          website_score?: number
          social_presence?: string | null
          ad_presence?: boolean
          opportunity_score?: number
          pain_points?: Json
          recommended_services?: Json
          ai_summary?: string | null
          lat?: number | null
          lng?: number | null
          added_by?: string | null
          source?: string
          enriched_at?: string | null
          scored_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          business_name?: string
          industry?: string
          location?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number
          review_count?: number
          website_score?: number
          social_presence?: string | null
          ad_presence?: boolean
          opportunity_score?: number
          pain_points?: Json
          recommended_services?: Json
          ai_summary?: string | null
          lat?: number | null
          lng?: number | null
          added_by?: string | null
          source?: string
          enriched_at?: string | null
          scored_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lead_assignments: {
        Row: {
          id: string
          team_id: string
          lead_id: string
          assigned_to: string | null
          assigned_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          lead_id: string
          assigned_to?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          lead_id?: string
          assigned_to?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      outreach_logs: {
        Row: {
          id: string
          lead_id: string
          sent_by: string
          channel: OutreachChannel
          subject: string | null
          body: string
          opened: boolean
          responded: boolean
          sent_at: string
          opened_at: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          sent_by: string
          channel: OutreachChannel
          subject?: string | null
          body: string
          opened?: boolean
          responded?: boolean
          sent_at?: string
          opened_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          sent_by?: string
          channel?: OutreachChannel
          subject?: string | null
          body?: string
          opened?: boolean
          responded?: boolean
          sent_at?: string
          opened_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          team_id: string
          lead_id: string | null
          member_id: string | null
          action_type: string
          description: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          lead_id?: string | null
          member_id?: string | null
          action_type: string
          description: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          lead_id?: string | null
          member_id?: string | null
          action_type?: string
          description?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: SubscriptionTier
      team_member_role: TeamMemberRole
      outreach_channel: OutreachChannel
    }
  }
}
