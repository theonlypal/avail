-- Call Tracking & Analytics Schema
-- This migration adds call records, lead folders, and analytics tables

-- ============================================
-- PREREQUISITES
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================
-- CALL RECORDS TABLE
-- ============================================

CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_sid TEXT UNIQUE NOT NULL,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Call metadata
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'no_answer', 'busy')),

  -- Success metrics
  call_success BOOLEAN DEFAULT false,
  success_reason TEXT,
  sentiment_score NUMERIC(3,2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),

  -- Transcript data
  full_transcript JSONB DEFAULT '[]'::jsonb,
  notes TEXT,

  -- Performance metrics
  agent_talk_time_seconds INTEGER DEFAULT 0,
  lead_talk_time_seconds INTEGER DEFAULT 0,
  ai_suggestions_count INTEGER DEFAULT 0,
  total_latency_ms INTEGER DEFAULT 707,

  -- Audio recording (optional)
  recording_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAD FOLDERS TABLE
-- ============================================

CREATE TABLE lead_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue' CHECK (color IN ('blue', 'purple', 'emerald', 'amber', 'red', 'cyan', 'pink', 'gray')),
  icon TEXT DEFAULT 'folder', -- lucide icon name
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, name)
);

-- ============================================
-- UPDATE LEADS TABLE
-- ============================================

-- Add new columns to existing leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES lead_folders(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_called_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS successful_calls INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_status TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_sentiment_score NUMERIC(3,2);

-- ============================================
-- ANALYTICS DAILY AGGREGATE TABLE
-- ============================================

CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Lead metrics
  leads_generated INTEGER DEFAULT 0,
  leads_called INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,

  -- Call metrics
  total_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  no_answer_calls INTEGER DEFAULT 0,
  avg_call_duration_seconds INTEGER,
  total_call_time_seconds INTEGER,

  -- Success metrics
  avg_sentiment_score NUMERIC(3,2),
  avg_latency_ms INTEGER,
  conversion_rate NUMERIC(5,2), -- Percentage

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, date)
);

-- ============================================
-- UPDATE TEAM_MEMBERS TABLE
-- ============================================

-- Add call tracking columns to team members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS calls_today INTEGER DEFAULT 0;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS calls_total INTEGER DEFAULT 0;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'away', 'offline'));

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_call_records_lead_id ON call_records(lead_id);
CREATE INDEX idx_call_records_team_id ON call_records(team_id);
CREATE INDEX idx_call_records_started_at ON call_records(started_at DESC);
CREATE INDEX idx_call_records_status ON call_records(status);
CREATE INDEX idx_call_records_call_success ON call_records(call_success);
CREATE INDEX idx_leads_folder_id ON leads(folder_id);
CREATE INDEX idx_leads_last_called_at ON leads(last_called_at DESC);
CREATE INDEX idx_lead_folders_team_id ON lead_folders(team_id);
CREATE INDEX idx_analytics_daily_team_date ON analytics_daily(team_id, date DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update call_records updated_at
CREATE TRIGGER update_call_records_updated_at BEFORE UPDATE ON call_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update lead_folders updated_at
CREATE TRIGGER update_lead_folders_updated_at BEFORE UPDATE ON lead_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update analytics_daily updated_at
CREATE TRIGGER update_analytics_daily_updated_at BEFORE UPDATE ON analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update lead stats after call
CREATE OR REPLACE FUNCTION update_lead_after_call()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE leads
    SET
      last_called_at = NEW.ended_at,
      call_count = call_count + 1,
      successful_calls = successful_calls + (CASE WHEN NEW.call_success THEN 1 ELSE 0 END),
      last_call_status = NEW.status,
      last_call_notes = NEW.notes,
      last_sentiment_score = NEW.sentiment_score
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_lead_stats_after_call
  AFTER INSERT OR UPDATE ON call_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_lead_after_call();

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(p_team_id TEXT, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_leads_generated INTEGER;
  v_leads_called INTEGER;
  v_total_calls INTEGER;
  v_successful_calls INTEGER;
  v_failed_calls INTEGER;
  v_no_answer_calls INTEGER;
  v_avg_duration INTEGER;
  v_total_duration INTEGER;
  v_avg_sentiment NUMERIC(3,2);
  v_conversion_rate NUMERIC(5,2);
BEGIN
  -- Count leads generated on this date
  SELECT COUNT(*) INTO v_leads_generated
  FROM leads
  WHERE team_id = p_team_id
    AND DATE(created_at) = p_date;

  -- Count leads called on this date
  SELECT COUNT(DISTINCT lead_id) INTO v_leads_called
  FROM call_records
  WHERE team_id = p_team_id
    AND DATE(started_at) = p_date;

  -- Call metrics
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE call_success = true),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'no_answer'),
    AVG(duration_seconds)::INTEGER,
    SUM(duration_seconds)::INTEGER,
    AVG(sentiment_score)
  INTO
    v_total_calls,
    v_successful_calls,
    v_failed_calls,
    v_no_answer_calls,
    v_avg_duration,
    v_total_duration,
    v_avg_sentiment
  FROM call_records
  WHERE team_id = p_team_id
    AND DATE(started_at) = p_date
    AND status = 'completed';

  -- Calculate conversion rate
  v_conversion_rate := CASE
    WHEN v_total_calls > 0 THEN (v_successful_calls::NUMERIC / v_total_calls::NUMERIC) * 100
    ELSE 0
  END;

  -- Insert or update analytics record
  INSERT INTO analytics_daily (
    team_id,
    date,
    leads_generated,
    leads_called,
    total_calls,
    successful_calls,
    failed_calls,
    no_answer_calls,
    avg_call_duration_seconds,
    total_call_time_seconds,
    avg_sentiment_score,
    conversion_rate
  ) VALUES (
    p_team_id,
    p_date,
    v_leads_generated,
    v_leads_called,
    v_total_calls,
    v_successful_calls,
    v_failed_calls,
    v_no_answer_calls,
    v_avg_duration,
    v_total_duration,
    v_avg_sentiment,
    v_conversion_rate
  )
  ON CONFLICT (team_id, date)
  DO UPDATE SET
    leads_generated = EXCLUDED.leads_generated,
    leads_called = EXCLUDED.leads_called,
    total_calls = EXCLUDED.total_calls,
    successful_calls = EXCLUDED.successful_calls,
    failed_calls = EXCLUDED.failed_calls,
    no_answer_calls = EXCLUDED.no_answer_calls,
    avg_call_duration_seconds = EXCLUDED.avg_call_duration_seconds,
    total_call_time_seconds = EXCLUDED.total_call_time_seconds,
    avg_sentiment_score = EXCLUDED.avg_sentiment_score,
    conversion_rate = EXCLUDED.conversion_rate,
    updated_at = NOW();
END;
$$ LANGUAGE 'plpgsql';

-- Function to automatically aggregate analytics after call
CREATE OR REPLACE FUNCTION auto_aggregate_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM aggregate_daily_analytics(NEW.team_id, DATE(NEW.started_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER auto_aggregate_on_call_complete
  AFTER INSERT OR UPDATE ON call_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION auto_aggregate_analytics();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Note: RLS policies disabled - auth not configured yet

-- ============================================
-- SEED DEFAULT FOLDERS
-- ============================================

-- Function to create default folders for a team
CREATE OR REPLACE FUNCTION create_default_folders(p_team_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO lead_folders (team_id, name, description, color, icon, sort_order) VALUES
    (p_team_id, 'Hot Leads', 'High-priority leads ready to call', 'red', 'flame', 1),
    (p_team_id, 'Warm Leads', 'Promising leads to follow up', 'amber', 'sun', 2),
    (p_team_id, 'Cold Leads', 'Leads that need warming up', 'blue', 'snowflake', 3),
    (p_team_id, 'Contacted', 'Leads we''ve already called', 'purple', 'phone', 4),
    (p_team_id, 'Converted', 'Successful conversions', 'emerald', 'check-circle', 5),
    (p_team_id, 'Do Not Call', 'Leads to skip', 'gray', 'x-circle', 6)
  ON CONFLICT (team_id, name) DO NOTHING;
END;
$$ LANGUAGE 'plpgsql';

-- Create default folders for existing teams
DO $$
DECLARE
  team_record RECORD;
BEGIN
  FOR team_record IN SELECT id FROM teams LOOP
    PERFORM create_default_folders(team_record.id);
  END LOOP;
END $$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE call_records IS 'Stores complete call records with transcripts and success metrics';
COMMENT ON TABLE lead_folders IS 'Organizational folders for categorizing leads';
COMMENT ON TABLE analytics_daily IS 'Daily aggregated analytics for team performance tracking';
COMMENT ON FUNCTION aggregate_daily_analytics IS 'Aggregates call and lead metrics for a specific team and date';
COMMENT ON FUNCTION create_default_folders IS 'Creates standard folder structure for a new team';
