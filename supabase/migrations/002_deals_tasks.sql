-- Deals & Tasks Migration for Leadly.AI CRM
-- This adds core CRM functionality: deal pipeline management and task tracking

-- Create deal_stage enum
CREATE TYPE deal_stage AS ENUM (
  'new',
  'qualified',
  'demo',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

-- Create task_status enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');

-- Create task_priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ===================================
-- PIPELINES TABLE
-- ===================================
-- Define custom sales pipelines per team
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Sales Pipeline',
  stages JSONB NOT NULL DEFAULT '["New", "Qualified", "Demo", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]'::jsonb,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- DEALS TABLE
-- ===================================
-- Tracks sales opportunities through pipeline stages
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  stage deal_stage NOT NULL DEFAULT 'new',
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
  expected_close_date DATE,
  actual_close_date DATE,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  win_reason TEXT,
  loss_reason TEXT,
  competitor TEXT,
  next_step TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- DEAL STAGE HISTORY TABLE
-- ===================================
-- Track deal progression through pipeline
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage deal_stage,
  to_stage deal_stage NOT NULL,
  changed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_in_stage INTEGER, -- seconds spent in previous stage
  notes TEXT
);

-- ===================================
-- TASKS TABLE
-- ===================================
-- Task management system for deals, leads, and general work
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  related_to_type TEXT, -- 'lead', 'deal', 'contact', null for standalone
  related_to_id TEXT, -- ID of related record
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- For subtasks
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Deals indexes
CREATE INDEX idx_deals_team_id ON deals(team_id);
CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_owner_id ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Deal stage history indexes
CREATE INDEX idx_deal_stage_history_deal_id ON deal_stage_history(deal_id);
CREATE INDEX idx_deal_stage_history_changed_at ON deal_stage_history(changed_at DESC);

-- Tasks indexes
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_related_to ON tasks(related_to_type, related_to_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Pipelines index
CREATE INDEX idx_pipelines_team_id ON pipelines(team_id);

-- ===================================
-- TRIGGERS
-- ===================================

-- Update deals.updated_at on change
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();

-- Update tasks.updated_at on change
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Track deal stage changes
CREATE OR REPLACE FUNCTION track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if stage actually changed
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO deal_stage_history (
      deal_id,
      from_stage,
      to_stage,
      changed_by,
      duration_in_stage
    ) VALUES (
      NEW.id,
      OLD.stage,
      NEW.stage,
      NEW.owner_id, -- Could be improved to track actual changer
      EXTRACT(EPOCH FROM (NOW() - OLD.stage_changed_at))::INTEGER
    );

    -- Update stage_changed_at
    NEW.stage_changed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_deal_stage_changes
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION track_deal_stage_change();

-- Auto-complete tasks when status changes to completed
CREATE OR REPLACE FUNCTION auto_complete_task()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_complete_task_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_task();

-- ===================================
-- DEFAULT DATA
-- ===================================

-- Create default pipeline for each existing team
INSERT INTO pipelines (team_id, name, is_default)
SELECT id, 'Default Sales Pipeline', true
FROM teams
ON CONFLICT DO NOTHING;

-- ===================================
-- COMMENTS
-- ===================================

COMMENT ON TABLE deals IS 'Sales opportunities tracked through pipeline stages';
COMMENT ON TABLE pipelines IS 'Custom sales pipeline definitions per team';
COMMENT ON TABLE tasks IS 'Task management system for tracking work items';
COMMENT ON TABLE deal_stage_history IS 'Audit log of deal stage progressions';

COMMENT ON COLUMN deals.value IS 'Deal value in currency specified';
COMMENT ON COLUMN deals.probability IS 'Likelihood of closing (0-100%)';
COMMENT ON COLUMN deals.stage IS 'Current pipeline stage';
COMMENT ON COLUMN tasks.related_to_type IS 'Type of related record (lead/deal/contact)';
COMMENT ON COLUMN tasks.related_to_id IS 'ID of related record';
