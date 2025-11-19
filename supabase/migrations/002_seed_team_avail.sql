-- Seed Team Avail
-- This creates the initial team with Zach, Ryan, and DC

-- Insert Team Avail
INSERT INTO teams (id, team_name, subscription_tier)
VALUES ('00000000-0000-0000-0000-000000000001', 'Avail', 'pro')
ON CONFLICT (id) DO NOTHING;

-- Insert Team Members (without user_id initially - will be linked after auth signup)
INSERT INTO team_members (id, team_id, name, email, role)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Zach', 'zach@leadly.ai', 'owner'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Ryan', 'ryan@leadly.ai', 'manager'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'DC', 'dc@leadly.ai', 'rep')
ON CONFLICT (email) DO NOTHING;

-- Optional: Insert a sample lead for testing
INSERT INTO leads (
  id, team_id, business_name, industry, location, phone, email, website,
  rating, review_count, website_score, social_presence, ad_presence,
  opportunity_score, pain_points, recommended_services, ai_summary,
  lat, lng, added_by, source
)
VALUES (
  'sd-001',
  '00000000-0000-0000-0000-000000000001',
  'Sample Dental Clinic',
  'Dental Clinics',
  'San Diego, CA',
  '(619) 555-0001',
  'contact@sampledentalclinic.com',
  '',
  3.5,
  25,
  30,
  'Basic',
  true,
  75,
  '["No AI on website", "Slow lead response", "Manual booking"]'::jsonb,
  '["AI Receptionist", "Automated SMS", "Online Booking"]'::jsonb,
  'High potential for AI automation due to manual workflows and slow follow-up times.',
  32.7157,
  -117.1611,
  '00000000-0000-0000-0000-000000000011',
  'manual'
)
ON CONFLICT (id) DO NOTHING;

-- Assign the sample lead to Zach
INSERT INTO lead_assignments (team_id, lead_id, assigned_to)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sd-001',
  '00000000-0000-0000-0000-000000000011'
)
ON CONFLICT (lead_id) DO NOTHING;
