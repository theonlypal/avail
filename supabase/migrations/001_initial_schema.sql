-- Leadly.AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE team_member_role AS ENUM ('owner', 'manager', 'rep');
CREATE TYPE outreach_channel AS ENUM ('email', 'sms');

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  subscription_tier subscription_tier DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members table (connected to Supabase Auth)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role team_member_role DEFAULT 'rep',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id TEXT PRIMARY KEY, -- Keep sd-001 format for compatibility
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  website_score INTEGER DEFAULT 0,
  social_presence TEXT,
  ad_presence BOOLEAN DEFAULT false,
  opportunity_score INTEGER DEFAULT 0,
  pain_points JSONB DEFAULT '[]'::jsonb,
  recommended_services JSONB DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  added_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'manual', -- manual, google, yelp, imported
  enriched_at TIMESTAMPTZ,
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Assignments table
CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id) -- Each lead can only have one assignment
);

-- Outreach Logs table
CREATE TABLE outreach_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  channel outreach_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  opened BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs for timeline
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- lead_added, lead_assigned, outreach_sent, etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_team_id ON leads(team_id);
CREATE INDEX idx_leads_industry ON leads(industry);
CREATE INDEX idx_leads_opportunity_score ON leads(opportunity_score);
CREATE INDEX idx_leads_location ON leads(location);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_lead_assignments_team_id ON lead_assignments(team_id);
CREATE INDEX idx_lead_assignments_assigned_to ON lead_assignments(assigned_to);
CREATE INDEX idx_outreach_logs_lead_id ON outreach_logs(lead_id);
CREATE INDEX idx_outreach_logs_sent_by ON outreach_logs(sent_by);
CREATE INDEX idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- GeoJSON index for map queries
CREATE INDEX idx_leads_location_geo ON leads USING gist(
  point(lng, lat)::geometry
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_assignments_updated_at BEFORE UPDATE ON lead_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Teams: Users can only see their own team
CREATE POLICY "Users can view their own team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Team Members: Users can view members of their team
CREATE POLICY "Users can view their team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Leads: Users can view leads for their team
CREATE POLICY "Users can view their team leads" ON leads
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads for their team" ON leads
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their team leads" ON leads
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Lead Assignments: Users can view/modify assignments for their team
CREATE POLICY "Users can view their team assignments" ON lead_assignments
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their team assignments" ON lead_assignments
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Outreach Logs: Users can view/create logs for their team leads
CREATE POLICY "Users can view outreach logs" ON outreach_logs
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create outreach logs" ON outreach_logs
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT id FROM leads WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Activity Logs: Users can view their team activity
CREATE POLICY "Users can view their team activity" ON activity_logs
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Function to log activities automatically
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
DECLARE
  team_id_val UUID;
  description_val TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    team_id_val := NEW.team_id;
    description_val := 'New lead added: ' || NEW.business_name;
    INSERT INTO activity_logs (team_id, lead_id, member_id, action_type, description)
    VALUES (team_id_val, NEW.id, NEW.added_by, 'lead_added', description_val);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_new_lead AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION log_lead_activity();

-- Function to log assignment changes
CREATE OR REPLACE FUNCTION log_assignment_activity()
RETURNS TRIGGER AS $$
DECLARE
  lead_name TEXT;
  member_name TEXT;
  description_val TEXT;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT business_name INTO lead_name FROM leads WHERE id = NEW.lead_id;
    SELECT name INTO member_name FROM team_members WHERE id = NEW.assigned_to;
    description_val := 'Lead ' || lead_name || ' assigned to ' || member_name;

    INSERT INTO activity_logs (team_id, lead_id, member_id, action_type, description)
    VALUES (NEW.team_id, NEW.lead_id, NEW.assigned_to, 'lead_assigned', description_val);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_assignment_change AFTER INSERT OR UPDATE ON lead_assignments
  FOR EACH ROW EXECUTE FUNCTION log_assignment_activity();
