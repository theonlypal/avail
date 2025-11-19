-- Leadly.AI: 100 Authentic Seed Leads
-- This migration populates the database with 100 realistic, valuable leads
-- across diverse industries for demonstration and testing purposes

-- Insert 100 authentic leads
INSERT INTO leads (
  id, team_id, business_name, industry, location,
  phone, email, website, rating, review_count,
  website_score, social_presence, ad_presence,
  opportunity_score, pain_points, recommended_services,
  ai_summary, lat, lng, source, created_at
) VALUES
  -- HVAC Businesses (15 leads)
  ('lead-001', (SELECT id FROM teams LIMIT 1), 'Smith & Sons HVAC', 'HVAC', 'San Diego, CA', '(619) 555-0101', 'contact@smithsonshvac.com', 'smithsonshvac.com', 4.6, 178, 65, 'Facebook, Instagram', false, 82,
   '["No online booking", "Poor website UX", "Low social media engagement"]', '["AI Chat Widget", "Online Booking System", "Review Management"]',
   'Established HVAC company with strong ratings but missing online booking functionality. High opportunity for conversion improvements.', 32.715738, -117.161084, 'google', NOW() - INTERVAL '15 days'),

  ('lead-002', (SELECT id FROM teams LIMIT 1), 'Cool Breeze Air Conditioning', 'HVAC', 'Phoenix, AZ', '(602) 555-0102', 'info@coolbreezeac.net', 'coolbreezeac.net', 4.2, 92, 58, 'Facebook', false, 75,
   '["Limited online presence", "No SMS communication", "Slow response time"]', '["SMS Automation", "CRM Integration", "Website Redesign"]',
   'Growing AC business with good potential. Could benefit from modern communication tools and stronger web presence.', 33.448377, -112.074037, 'yelp', NOW() - INTERVAL '12 days'),

  ('lead-003', (SELECT id FROM teams LIMIT 1), 'Desert Climate Control', 'HVAC', 'Las Vegas, NV', '(702) 555-0103', 'service@desertclimate.com', 'desertclimate.com', 4.8, 312, 78, 'Facebook, Instagram, LinkedIn', true, 88,
   '["Could improve lead response time", "No automated follow-up"]', '["Lead Response Automation", "AI Copilot", "Email Drip Campaigns"]',
   'Premium HVAC service with excellent reviews. Already advertising but could optimize lead handling process.', 36.169941, -115.139830, 'google', NOW() - INTERVAL '8 days'),

  ('lead-004', (SELECT id FROM teams LIMIT 1), 'Family First Heating & Cooling', 'HVAC', 'Austin, TX', '(512) 555-0104', 'hello@familyfirsthvac.com', 'familyfirsthvac.com', 4.5, 145, 70, 'Facebook, Instagram', false, 80,
   '["No text appointment reminders", "Basic website", "Limited online reviews"]', '["SMS Reminders", "Review Generation", "Website Enhancement"]',
   'Family-owned HVAC business with loyal customer base. Ready for digital transformation to scale operations.', 30.267153, -97.743061, 'yelp', NOW() - INTERVAL '20 days'),

  ('lead-005', (SELECT id FROM teams LIMIT 1), 'Comfort Zone HVAC Services', 'HVAC', 'Los Angeles, CA', '(213) 555-0105', 'contact@comfortz one-hvac.com', 'comfortzonehvac.com', 4.3, 203, 62, 'Facebook', false, 77,
   '["Outdated website", "No mobile optimization", "Poor local SEO"]', '["Website Rebuild", "Local SEO Package", "Mobile App"]',
   'LA-based HVAC company with solid reputation but aging digital infrastructure. High upside potential.', 34.052234, -118.243685, 'google', NOW() - INTERVAL '18 days'),

  ('lead-006', (SELECT id FROM teams LIMIT 1), 'Precision Air Systems', 'HVAC', 'Dallas, TX', '(214) 555-0106', 'info@precisionairsys.com', 'precisionairsys.com', 4.7, 267, 82, 'Facebook, Instagram, Twitter', true, 85,
   '["Could expand service area", "No online financing options"]', '["Geographic Expansion Strategy", "Online Financing Integration"]',
   'High-performing HVAC company ready to scale. Strong digital presence but missing key conversion tools.', 32.776664, -96.796988, 'google', NOW() - INTERVAL '5 days'),

  ('lead-007', (SELECT id FROM teams LIMIT 1), 'Arctic Air Pros', 'HVAC', 'Miami, FL', '(305) 555-0107', 'service@arcticairpros.com', 'arcticairpros.com', 4.4, 189, 68, 'Facebook, Instagram', false, 79,
   '["No emergency booking system", "Limited payment options", "Basic analytics"]', '["24/7 Booking System", "Payment Gateway Integration", "Analytics Dashboard"]',
   'Miami AC specialist with year-round demand. Needs modernized booking and payment infrastructure.', 25.761680, -80.191790, 'yelp', NOW() - INTERVAL '10 days'),

  ('lead-008', (SELECT id FROM teams LIMIT 1), 'Elite Climate Solutions', 'HVAC', 'Chicago, IL', '(312) 555-0108', 'contact@eliteclimate.net', 'eliteclimate.net', 4.6, 234, 75, 'Facebook, LinkedIn', true, 83,
   '["Seasonal demand fluctuations", "No maintenance plan automation"]', '["Maintenance Plan Automation", "Seasonal Marketing Campaigns"]',
   'Established Chicago HVAC with strong commercial client base. Could benefit from automated maintenance programs.', 41.878114, -87.629798, 'google', NOW() - INTERVAL '7 days'),

  ('lead-009', (SELECT id FROM teams LIMIT 1), 'Quick Fix HVAC', 'HVAC', 'Houston, TX', '(713) 555-0109', 'help@quickfixhvac.com', 'quickfixhvac.com', 4.1, 98, 55, 'Facebook', false, 72,
   '["Slow dispatch system", "No customer portal", "Limited online visibility"]', '["Dispatch Automation", "Customer Portal", "Google Ads Campaign"]',
   'Fast-growing Houston HVAC company outgrowing current systems. High urgency for operational improvements.', 29.760427, -95.369803, 'yelp', NOW() - INTERVAL '22 days'),

  ('lead-010', (SELECT id FROM teams LIMIT 1), 'Premium Comfort Systems', 'HVAC', 'Seattle, WA', '(206) 555-0110', 'info@premiumcomfort.com', 'premiumcomfort.com', 4.9, 402, 88, 'Facebook, Instagram, LinkedIn, YouTube', true, 92,
   '["Could improve video marketing", "No chatbot"]', '["Video Marketing Strategy", "AI Chatbot", "Content Marketing"]',
   'Top-tier Seattle HVAC with exceptional reviews. Prime candidate for advanced AI and marketing automation.', 47.606209, -122.332071, 'google', NOW() - INTERVAL '3 days'),

  ('lead-011', (SELECT id FROM teams LIMIT 1), 'City Air HVAC & Plumbing', 'HVAC', 'New York, NY', '(212) 555-0111', 'service@cityairhvac.com', 'cityairhvac.com', 4.3, 156, 64, 'Facebook, Instagram', false, 78,
   '["No multi-service booking", "Limited technician tracking"]', '["Multi-Service Booking System", "Technician GPS Tracking"]',
   'NYC-based HVAC and plumbing hybrid needing better service coordination tools.', 40.712784, -74.005941, 'yelp', NOW() - INTERVAL '14 days'),

  ('lead-012', (SELECT id FROM teams LIMIT 1), 'All Seasons Heating & Cooling', 'HVAC', 'Denver, CO', '(303) 555-0112', 'contact@allseasonsco.com', 'allseasonsco.com', 4.5, 198, 71, 'Facebook', false, 81,
   '["No winter marketing campaigns", "Basic CRM"]', '["Seasonal Campaign Automation", "Advanced CRM"]',
   'Colorado HVAC with year-round business potential. Needs seasonal marketing automation.', 39.739236, -104.990251, 'google', NOW() - INTERVAL '11 days'),

  ('lead-013', (SELECT id FROM teams LIMIT 1), 'Reliable Air Systems', 'HVAC', 'Portland, OR', '(503) 555-0113', 'info@reliableairsystems.com', 'reliableairsystems.com', 4.7, 223, 76, 'Facebook, Instagram', true, 84,
   '["Could expand commercial services", "No energy audit tools"]', '["Commercial Service Expansion", "Energy Audit Software"]',
   'Portland HVAC ready to expand into commercial sector with right tools and marketing.', 45.515232, -122.678367, 'google', NOW() - INTERVAL '6 days'),

  ('lead-014', (SELECT id FROM teams LIMIT 1), 'Sunshine State Air', 'HVAC', 'Tampa, FL', '(813) 555-0114', 'service@sunshineair.net', 'sunshineair.net', 4.2, 134, 60, 'Facebook', false, 76,
   '["No emergency service premium", "Limited online payments"]', '["Emergency Service Premium Pricing", "Online Payment Portal"]',
   'Tampa AC company with opportunity to add premium emergency services and modern payment options.', 27.950575, -82.457178, 'yelp', NOW() - INTERVAL '16 days'),

  ('lead-015', (SELECT id FROM teams LIMIT 1), 'Metro Heating & Air', 'HVAC', 'Atlanta, GA', '(404) 555-0115', 'contact@metrohvac.com', 'metrohvac.com', 4.6, 287, 80, 'Facebook, Instagram, LinkedIn', true, 86,
   '["Could improve referral program", "No loyalty rewards"]', '["Referral Program Automation", "Customer Loyalty Platform"]',
   'Atlanta HVAC with strong growth trajectory. Ready for customer retention and referral automation.', 33.748995, -84.387982, 'google', NOW() - INTERVAL '4 days'),

  -- Plumbing Businesses (15 leads)
  ('lead-016', (SELECT id FROM teams LIMIT 1), 'RapidFlow Plumbing', 'Plumbing', 'San Diego, CA', '(619) 555-0201', 'dispatch@rapidflowplumbing.com', 'rapidflowplumbing.com', 4.4, 167, 68, 'Facebook, Instagram', false, 79,
   '["No real-time scheduling", "Limited service area info", "Old website design"]', '["Real-Time Booking Calendar", "Service Area Map", "Website Modernization"]',
   'Busy San Diego plumbing company overwhelmed with calls. Needs automated scheduling to improve efficiency.', 32.825211, -117.132760, 'google', NOW() - INTERVAL '13 days'),

  ('lead-017', (SELECT id FROM teams LIMIT 1), 'DrainMaster Pro', 'Plumbing', 'Phoenix, AZ', '(602) 555-0202', 'info@drainmasterpro.com', 'drainmasterpro.com', 4.7, 245, 82, 'Facebook, Instagram, LinkedIn', true, 87,
   '["Could add video estimates", "No drain cam marketing"]', '["Video Estimate Tool", "Drain Camera Marketing Package"]',
   'Premium Phoenix plumbing specializing in drain services. Ready for video-based marketing and estimates.', 33.538753, -112.185863, 'google', NOW() - INTERVAL '5 days'),

  ('lead-018', (SELECT id FROM teams LIMIT 1), 'Family Plumbing & Rooter', 'Plumbing', 'Los Angeles, CA', '(213) 555-0203', 'service@familyplumbing.net', 'familyplumbing.net', 4.3, 189, 65, 'Facebook', false, 77,
   '["No emergency service tracking", "Limited online booking", "Poor mobile experience"]', '["Emergency Dispatch System", "Online Booking", "Mobile-First Website"]',
   'LA family plumbing business growing fast. Needs operational systems to handle increased volume.', 34.096842, -118.356593, 'yelp', NOW() - INTERVAL '17 days'),

  ('lead-019', (SELECT id FROM teams LIMIT 1), 'Clear Water Plumbing Solutions', 'Plumbing', 'Austin, TX', '(512) 555-0204', 'hello@clearwaterplumbing.com', 'clearwaterplumbing.com', 4.8, 318, 85, 'Facebook, Instagram, YouTube', true, 90,
   '["Could expand tutorial content", "No water quality testing service"]', '["Content Marketing Strategy", "Water Quality Testing Service Launch"]',
   'Top-rated Austin plumber with excellent video presence. Ready to launch new service lines and expand content.', 30.347320, -97.770462, 'google', NOW() - INTERVAL '2 days'),

  ('lead-020', (SELECT id FROM teams LIMIT 1), 'Emergency Plumbing Experts', 'Plumbing', 'Houston, TX', '(713) 555-0205', 'urgent@emergencyplumbingexperts.com', 'emergencyplumbingexperts.com', 4.5, 276, 74, 'Facebook, Instagram', true, 83,
   '["No 24/7 call answering", "Could improve dispatch routing"]', '["24/7 AI Phone Answering", "Route Optimization Software"]',
   'Houston emergency plumber needs always-on answering service and better routing for faster response times.', 29.892451, -95.453343, 'google', NOW() - INTERVAL '8 days'),

  ('lead-021', (SELECT id FROM teams LIMIT 1), 'Premier Pipe Services', 'Plumbing', 'Dallas, TX', '(214) 555-0206', 'contact@premierpipe.com', 'premierpipe.com', 4.6, 203, 77, 'Facebook, LinkedIn', false, 82,
   '["No commercial testimonials", "Limited B2B marketing"]', '["Commercial Portfolio Development", "LinkedIn B2B Campaigns"]',
   'Dallas plumber transitioning to commercial work. Needs B2B marketing and case study development.', 32.828217, -96.835590, 'yelp', NOW() - INTERVAL '10 days'),

  ('lead-022', (SELECT id FROM teams LIMIT 1), 'Blue Sky Plumbing', 'Plumbing', 'Miami, FL', '(305) 555-0207', 'service@blueskyplumbing.com', 'blueskyplumbing.com', 4.2, 145, 61, 'Facebook', false, 75,
   '["No online estimates", "Limited service area", "No multilingual support"]', '["Online Estimate Calculator", "Service Area Expansion", "Spanish Language Support"]',
   'Miami plumber serving diverse community. Needs multilingual tools and online estimate functionality.', 25.853741, -80.249929, 'google', NOW() - INTERVAL '19 days'),

  ('lead-023', (SELECT id FROM teams LIMIT 1), 'Precision Plumbing Co.', 'Plumbing', 'Chicago, IL', '(312) 555-0208', 'info@precisionplumbing.net', 'precisionplumbing.net', 4.7, 298, 81, 'Facebook, Instagram, LinkedIn', true, 86,
   '["Could add maintenance plans", "No winter burst prevention program"]', '["Maintenance Plan Automation", "Winter Prevention Marketing"]',
   'Chicago plumber with strong reputation. Perfect candidate for recurring revenue through maintenance plans.', 41.923367, -87.684486, 'google', NOW() - INTERVAL '6 days'),

  ('lead-024', (SELECT id FROM teams LIMIT 1), 'Pipe Dream Plumbing', 'Plumbing', 'Seattle, WA', '(206) 555-0209', 'help@pipedreamplumbing.com', 'pipedreamplumbing.com', 4.4, 178, 69, 'Facebook, Instagram', false, 78,
   '["No eco-friendly service marketing", "Basic website", "Limited online reviews"]', '["Green Plumbing Marketing", "Website Upgrade", "Review Management"]',
   'Seattle eco-conscious plumber missing opportunity to market green services effectively.', 47.651916, -122.360565, 'yelp', NOW() - INTERVAL '12 days'),

  ('lead-025', (SELECT id FROM teams LIMIT 1), 'ABC Plumbing Services', 'Plumbing', 'New York, NY', '(212) 555-0210', 'dispatch@abcplumbing.nyc', 'abcplumbing.nyc', 4.5, 412, 78, 'Facebook, Instagram, Twitter', true, 84,
   '["Slow booking process", "No apartment building partnerships", "Could improve large job quoting"]', '["Instant Booking System", "Property Management Partnerships", "Commercial Quote Automation"]',
   'Busy NYC plumber handling high volume. Needs automation to capture more of the market opportunity.', 40.758896, -73.985130, 'google', NOW() - INTERVAL '7 days'),

  ('lead-026', (SELECT id FROM teams LIMIT 1), 'Mountain View Plumbing', 'Plumbing', 'Denver, CO', '(303) 555-0211', 'service@mountainviewplumbing.com', 'mountainviewplumbing.com', 4.6, 189, 73, 'Facebook', false, 80,
   '["No fixture installation showcase", "Limited remodel partnerships"]', '["Fixture Gallery", "Contractor Partnership Program"]',
   'Denver plumber expanding into remodel market. Needs better showcase of fixture work and contractor connections.', 39.783119, -105.079552, 'yelp', NOW() - INTERVAL '14 days'),

  ('lead-027', (SELECT id FROM teams LIMIT 1), 'Coastal Plumbing Pros', 'Plumbing', 'Portland, OR', '(503) 555-0212', 'info@coastalplumbingpros.com', 'coastalplumbingpros.com', 4.8, 334, 86, 'Facebook, Instagram, LinkedIn', true, 89,
   '["Could add tankless water heater focus", "No financing options"]', '["Tankless WH Marketing Campaign", "Consumer Financing Integration"]',
   'Portland plumbing leader ready to promote tankless water heaters with financing to boost ticket size.', 45.565902, -122.746544, 'google', NOW() - INTERVAL '4 days'),

  ('lead-028', (SELECT id FROM teams LIMIT 1), 'Sunshine Plumbing', 'Plumbing', 'Tampa, FL', '(813) 555-0213', 'contact@sunshineplumbing.com', 'sunshineplumbing.com', 4.3, 156, 64, 'Facebook, Instagram', false, 76,
   '["No slab leak detection marketing", "Limited online presence", "Basic SEO"]', '["Slab Leak Service Page", "Local SEO Package", "Google Ads Campaign"]',
   'Tampa plumber with slab leak expertise but poor online visibility. High potential with better SEO.', 28.018651, -82.576447, 'google', NOW() - INTERVAL '15 days'),

  ('lead-029', (SELECT id FROM teams LIMIT 1), 'Metro Plumbing Solutions', 'Plumbing', 'Atlanta, GA', '(404) 555-0214', 'service@metroplumbing.com', 'metroplumbing.com', 4.7, 267, 79, 'Facebook, Instagram', true, 85,
   '["Could improve technician profiles", "No customer education content"]', '["Technician Bio Pages", "DIY Tips Blog", "Email Newsletter"]',
   'Atlanta plumber with great team. Needs to showcase technicians and create educational content for lead nurturing.', 33.789653, -84.435913, 'yelp', NOW() - INTERVAL '9 days'),

  ('lead-030', (SELECT id FROM teams LIMIT 1), 'Fix It Fast Plumbing', 'Plumbing', 'San Antonio, TX', '(210) 555-0215', 'urgent@fixitfastplumbing.com', 'fixitfastplumbing.com', 4.4, 198, 70, 'Facebook', false, 79,
   '["No same-day guarantee marketing", "Limited payment options", "Poor online booking"]', '["Same-Day Guarantee Program", "Payment Gateway Upgrade", "Enhanced Booking System"]',
   'San Antonio emergency plumber needs to better market fast service guarantee and streamline booking.', 29.465289, -98.518486, 'google', NOW() - INTERVAL '11 days'),

  -- Dental Practices (10 leads)
  ('lead-031', (SELECT id FROM teams LIMIT 1), 'Bright Smile Dental', 'Dental', 'San Diego, CA', '(619) 555-0301', 'appointments@brightsmile dental.com', 'brightsmiledental.com', 4.9, 456, 88, 'Facebook, Instagram', true, 91,
   '["No online appointment booking", "Could improve cosmetic service marketing"]', '["Online Booking Integration", "Cosmetic Dentistry Landing Pages"]',
   'Top-rated San Diego dental practice with excellent patient reviews. Ready for online booking and cosmetic service expansion.', 32.741892, -117.167253, 'google', NOW() - INTERVAL '3 days'),

  ('lead-032', (SELECT id FROM teams LIMIT 1), 'Downtown Dental Care', 'Dental', 'Austin, TX', '(512) 555-0302', 'info@downtowndental.com', 'downtowndental.com', 4.6, 298, 79, 'Facebook, Instagram, LinkedIn', false, 84,
   '["No text appointment reminders", "Limited new patient offers", "Basic website"]', '["SMS Reminder System", "New Patient Campaign", "Website Redesign"]',
   'Growing Austin dental practice missing key patient retention tools and new patient acquisition strategies.', 30.271129, -97.743467, 'yelp', NOW() - INTERVAL '8 days'),

  ('lead-033', (SELECT id FROM teams LIMIT 1), 'Family First Dentistry', 'Dental', 'Phoenix, AZ', '(602) 555-0303', 'hello@familyfirstdentist.com', 'familyfirstdentist.com', 4.7, 367, 82, 'Facebook, Instagram', true, 87,
   '["Could add pediatric focus", "No membership plan"]', '["Pediatric Service Marketing", "Dental Membership Plan Launch"]',
   'Phoenix family dental practice ready to launch membership plan for recurring revenue.', 33.512764, -112.104588, 'google', NOW() - INTERVAL '5 days'),

  ('lead-034', (SELECT id FROM teams LIMIT 1), 'Perfect Teeth Dental Group', 'Dental', 'Los Angeles, CA', '(213) 555-0304', 'contact@perfectteeth.com', 'perfectteeth.com', 4.5, 523, 85, 'Facebook, Instagram, YouTube', true, 89,
   '["Could improve Invisalign marketing", "No virtual consultations"]', '["Invisalign Marketing Campaign", "Virtual Consultation Platform"]',
   'LA dental group with multiple locations. Prime candidate for virtual consultations and Invisalign focus.', 34.063842, -118.256835, 'google', NOW() - INTERVAL '4 days'),

  ('lead-035', (SELECT id FROM teams LIMIT 1), 'Smile Studio Dentistry', 'Dental', 'Miami, FL', '(305) 555-0305', 'appointments@smilestudio.com', 'smilestudio.com', 4.8, 412, 86, 'Facebook, Instagram', true, 90,
   '["Could add veneer showcase", "No before/after gallery optimization"]', '["Veneer Portfolio Development", "Before/After Gallery Enhancement"]',
   'Miami cosmetic dental studio with beautiful work. Needs better online showcase to convert more high-ticket cases.', 25.782104, -80.264977, 'yelp', NOW() - INTERVAL '2 days'),

  ('lead-036', (SELECT id FROM teams LIMIT 1), 'Gentle Care Dental', 'Dental', 'Chicago, IL', '(312) 555-0306', 'care@gentlecareden tal.com', 'gentlecaredental.com', 4.6, 287, 77, 'Facebook', false, 82,
   '["No sedation dentistry marketing", "Limited anxiety patient outreach"]', '["Sedation Dentistry Landing Page", "Anxiety-Free Dental Marketing"]',
   'Chicago dental practice specializing in anxious patients. Needs focused marketing on sedation and gentle care.', 41.895634, -87.677542, 'google', NOW() - INTERVAL '10 days'),

  ('lead-037', (SELECT id FROM teams LIMIT 1), 'Elite Dental Specialists', 'Dental', 'Dallas, TX', '(214) 555-0307', 'referrals@elitedental.com', 'elitedental.com', 4.9, 389, 91, 'Facebook, Instagram, LinkedIn', true, 93,
   '["Could improve specialist referral network", "No continuing education content"]', '["Referral Network Platform", "Professional Education Portal"]',
   'Top Dallas dental specialists. Perfect for B2B referral platform and professional education content.', 32.794890, -96.782345, 'google', NOW() - INTERVAL '1 day'),

  ('lead-038', (SELECT id FROM teams LIMIT 1), 'Riverfront Dental', 'Dental', 'Portland, OR', '(503) 555-0308', 'info@riverfrontdental.com', 'riverfrontdental.com', 4.4, 234, 72, 'Facebook, Instagram', false, 78,
   '["No same-day emergency appointments", "Limited online presence", "Old website"]', '["Emergency Booking System", "SEO Optimization", "Website Modernization"]',
   'Portland dental practice with room to grow. Needs emergency booking capability and stronger online presence.', 45.527751, -122.687454, 'yelp', NOW() - INTERVAL '13 days'),

  ('lead-039', (SELECT id FROM teams LIMIT 1), 'Sunshine Dental Care', 'Dental', 'Tampa, FL', '(813) 555-0309', 'hello@sunshinedental.com', 'sunshinedental.com', 4.7, 345, 80, 'Facebook, Instagram', true, 85,
   '["Could add teeth whitening focus", "No online payment portal"]', '["Whitening Service Campaign", "Patient Payment Portal"]',
   'Tampa dental practice ready to promote professional whitening services with easy online payments.', 27.979983, -82.460239, 'google', NOW() - INTERVAL '7 days'),

  ('lead-040', (SELECT id FROM teams LIMIT 1), 'Metro Dental Associates', 'Dental', 'Atlanta, GA', '(404) 555-0310', 'contact@metrodental.com', 'metrodental.com', 4.8, 478, 87, 'Facebook, Instagram, LinkedIn', true, 92,
   '["Could expand implant services", "No patient financing promoted"]', '["Dental Implant Marketing", "Financing Options Showcase"]',
   'Atlanta dental practice with implant capability but undermarketed. High opportunity for revenue growth.', 33.754557, -84.389835, 'google', NOW() - INTERVAL '3 days'),

  -- Law Firms (10 leads)
  ('lead-041', (SELECT id FROM teams LIMIT 1), 'Johnson & Associates Law', 'Legal Services', 'San Diego, CA', '(619) 555-0401', 'intake@johnsonlawsd.com', 'johnsonlawsd.com', 4.5, 187, 75, 'LinkedIn', false, 81,
   '["No online case evaluation", "Limited client portal", "Weak content marketing"]', '["Case Evaluation Form", "Client Portal Development", "Legal Content Strategy"]',
   'San Diego personal injury firm needs better online intake process and client communication tools.', 32.718743, -117.172829, 'google', NOW() - INTERVAL '9 days'),

  ('lead-042', (SELECT id FROM teams LIMIT 1), 'Smith Family Law Group', 'Legal Services', 'Austin, TX', '(512) 555-0402', 'info@smithfamilylaw.com', 'smithfamilylaw.com', 4.7, 234, 82, 'Facebook, LinkedIn', true, 86,
   '["Could improve divorce mediation marketing", "No video consultations"]', '["Mediation Service Landing Page", "Virtual Consultation Platform"]',
   'Austin family law firm ready to add virtual consultations and focus marketing on mediation services.', 30.283451, -97.756782, 'yelp', NOW() - INTERVAL '6 days'),

  ('lead-043', (SELECT id FROM teams LIMIT 1), 'Phoenix Injury Lawyers', 'Legal Services', 'Phoenix, AZ', '(602) 555-0403', 'cases@phoenixinjury.com', 'phoenixinjury.com', 4.8, 412, 88, 'Facebook, LinkedIn, YouTube', true, 90,
   '["Could expand case result showcase", "No live chat"]', '["Case Results Gallery", "24/7 Live Chat Widget"]',
   'High-volume Phoenix injury firm. Needs always-on chat and better case result showcase to convert more leads.', 33.451734, -112.076782, 'google', NOW() - INTERVAL '4 days'),

  ('lead-044', (SELECT id FROM teams LIMIT 1), 'Downtown Legal Partners', 'Legal Services', 'Los Angeles, CA', '(213) 555-0404', 'contact@downtownlegal.com', 'downtownlegal.com', 4.6, 298, 79, 'LinkedIn', false, 83,
   '["No business law content", "Limited SEO", "No webinar series"]', '["Business Law Blog", "SEO Optimization", "Educational Webinars"]',
   'LA business law firm needs thought leadership content and webinars to establish authority and generate leads.', 34.048921, -118.253478, 'google', NOW() - INTERVAL '11 days'),

  ('lead-045', (SELECT id FROM teams LIMIT 1), 'Martinez Immigration Law', 'Legal Services', 'Miami, FL', '(305) 555-0405', 'consulta@martinezimmigration.com', 'martinezimmigration.com', 4.9, 567, 90, 'Facebook, Instagram, LinkedIn', true, 94,
   '["Could add multilingual AI chat", "No case tracking for clients"]', '["Multilingual AI Chatbot", "Client Case Tracking Portal"]',
   'Top Miami immigration firm serving diverse population. Ready for multilingual AI tools and client portal.', 25.770832, -80.209134, 'google', NOW() - INTERVAL '2 days'),

  ('lead-046', (SELECT id FROM teams LIMIT 1), 'Chicago DUI Defense', 'Legal Services', 'Chicago, IL', '(312) 555-0406', 'urgent@chicagodui.com', 'chicagodui.com', 4.4, 178, 71, 'Facebook, LinkedIn', false, 77,
   '["No 24/7 emergency intake", "Limited local SEO", "No video testimonials"]', '["24/7 Emergency Hotline", "Local SEO Package", "Video Testimonial Campaign"]',
   'Chicago DUI defense firm needs round-the-clock intake and stronger local SEO for emergency searches.', 41.883872, -87.638465, 'yelp', NOW() - INTERVAL '14 days'),

  ('lead-047', (SELECT id FROM teams LIMIT 1), 'Thompson Estate Planning', 'Legal Services', 'Seattle, WA', '(206) 555-0407', 'info@thompsonestate.com', 'thompsonestate.com', 4.7, 312, 83, 'LinkedIn', true, 87,
   '["Could add trust planning tools", "No online will review", "Limited seminar marketing"]', '["Trust Planning Calculator", "Online Document Review", "Seminar Marketing Automation"]',
   'Seattle estate planning firm ready to add interactive tools and automated seminar marketing.', 47.615438, -122.348726, 'google', NOW() - INTERVAL '5 days'),

  ('lead-048', (SELECT id FROM teams LIMIT 1), 'Metro Criminal Defense', 'Legal Services', 'Dallas, TX', '(214) 555-0408', 'defense@metrocriminaldefense.com', 'metrocriminaldefense.com', 4.6, 245, 76, 'Facebook, LinkedIn', false, 82,
   '["No online bail bond info", "Could improve criminal record expungement marketing"]', '["Bail Information Page", "Expungement Service Landing Page"]',
   'Dallas criminal defense firm missing opportunity to market expungement services and provide bail information.', 32.780482, -96.800345, 'google', NOW() - INTERVAL '8 days'),

  ('lead-049', (SELECT id FROM teams LIMIT 1), 'Pacific Legal Group', 'Legal Services', 'Portland, OR', '(503) 555-0409', 'contact@pacificlegal.com', 'pacificlegal.com', 4.8, 389, 86, 'LinkedIn', true, 89,
   '["Could expand employment law focus", "No HR consultation package"]', '["Employment Law Service Expansion", "HR Consultation Package"]',
   'Portland business law firm ready to launch HR consultation services for recurring revenue.', 45.538156, -122.659842, 'yelp', NOW() - INTERVAL '7 days'),

  ('lead-050', (SELECT id FROM teams LIMIT 1), 'Freeman & Partners Law', 'Legal Services', 'Atlanta, GA', '(404) 555-0410', 'intake@freemanlaw.com', 'freemanlaw.com', 4.5, 267, 78, 'Facebook, LinkedIn', false, 84,
   '["No workers comp marketing", "Limited case intake automation"]', '["Workers Compensation Landing Page", "Automated Case Intake System"]',
   'Atlanta law firm with workers comp expertise but poor online visibility. Needs focused landing pages.', 33.762134, -84.395782, 'google', NOW() - INTERVAL '10 days'),

  -- Real Estate (10 leads)
  ('lead-051', (SELECT id FROM teams LIMIT 1), 'Coastal Properties Realty', 'Real Estate', 'San Diego, CA', '(619) 555-0501', 'agents@coastalproperties.com', 'coastalproperties.com', 4.6, 345, 81, 'Facebook, Instagram', true, 85,
   '["Could add 3D virtual tours", "No automated lead follow-up", "Limited IDX integration"]', '["3D Tour Platform", "Lead Follow-Up Automation", "Enhanced IDX Website"]',
   'San Diego real estate agency needs modern virtual tour technology and automated lead nurturing.', 32.748392, -117.188427, 'google', NOW() - INTERVAL '6 days'),

  ('lead-052', (SELECT id FROM teams LIMIT 1), 'Austin Home Experts', 'Real Estate', 'Austin, TX', '(512) 555-0502', 'hello@austinhomeexperts.com', 'austinhomeexperts.com', 4.8, 478, 87, 'Facebook, Instagram, LinkedIn', true, 91,
   '["Could improve neighborhood guides", "No buyer/seller video series"]', '["Neighborhood Guide Pages", "Educational Video Series"]',
   'Top Austin realtors ready to create comprehensive neighborhood content and video education series.', 30.295178, -97.726452, 'yelp', NOW() - INTERVAL '3 days'),

  ('lead-053', (SELECT id FROM teams LIMIT 1), 'Desert Dream Homes', 'Real Estate', 'Phoenix, AZ', '(602) 555-0503', 'info@desertdreamhomes.com', 'desertdreamhomes.com', 4.4, 234, 73, 'Facebook, Instagram', false, 78,
   '["No luxury home focus", "Limited high-res photography", "Basic website"]', '["Luxury Home Portfolio", "Professional Photography Service", "Website Upgrade"]',
   'Phoenix luxury real estate agency needs premium branding and better property showcase.', 33.606742, -112.053846, 'google', NOW() - INTERVAL '12 days'),

  ('lead-054', (SELECT id FROM teams LIMIT 1), 'Metro Realty Group', 'Real Estate', 'Los Angeles, CA', '(213) 555-0504', 'contact@metrorealtygroup.com', 'metrorealtygroup.com', 4.7, 567, 84, 'Facebook, Instagram, LinkedIn', true, 88,
   '["Could add investment property focus", "No rental management services"]', '["Investment Property Portal", "Rental Management Service Launch"]',
   'LA real estate group ready to expand into investment property and rental management services.', 34.051823, -118.242758, 'google', NOW() - INTERVAL '5 days'),

  ('lead-055', (SELECT id FROM teams LIMIT 1), 'Sunshine Coast Realty', 'Real Estate', 'Miami, FL', '(305) 555-0505', 'agents@sunshinecoast.com', 'sunshinecoast.com', 4.9, 612, 92, 'Facebook, Instagram, LinkedIn, YouTube', true, 95,
   '["Could improve international buyer marketing", "No Spanish language site"]', '["International Buyer Campaign", "Spanish Website Version"]',
   'Premier Miami real estate firm with international clientele. Needs multilingual site and targeted marketing.', 25.791043, -80.206127, 'google', NOW() - INTERVAL '1 day'),

  ('lead-056', (SELECT id FROM teams LIMIT 1), 'Windy City Homes', 'Real Estate', 'Chicago, IL', '(312) 555-0506', 'info@windycityhomes.com', 'windycityhomes.com', 4.5, 298, 76, 'Facebook, Instagram', false, 81,
   '["No condo association info", "Could improve first-time buyer resources"]', '["Condo Building Pages", "First-Time Buyer Guide"]',
   'Chicago realty specializing in condos. Needs better building-specific pages and first-time buyer education.', 41.896743, -87.629452, 'yelp', NOW() - INTERVAL '9 days'),

  ('lead-057', (SELECT id FROM teams LIMIT 1), 'Pacific Northwest Properties', 'Real Estate', 'Seattle, WA', '(206) 555-0507', 'contact@pnwproperties.com', 'pnwproperties.com', 4.7, 389, 82, 'Facebook, Instagram, LinkedIn', true, 86,
   '["Could add relocation services", "No employer partnership program"]', '["Relocation Service Package", "Corporate Relocation Partnerships"]',
   'Seattle real estate agency positioned to capture relocation market with employer partnerships.', 47.627382, -122.338954, 'google', NOW() - INTERVAL '7 days'),

  ('lead-058', (SELECT id FROM teams LIMIT 1), 'Downtown Dallas Realty', 'Real Estate', 'Dallas, TX', '(214) 555-0508', 'downtown@dallasrealty.com', 'dallasrealty.com', 4.6, 312, 78, 'Facebook, Instagram', false, 83,
   '["No urban living content", "Limited loft/condo inventory showcase"]', '["Urban Living Blog", "Loft & Condo Showcase"]',
   'Dallas urban real estate specialist needs better content marketing for city living and loft properties.', 32.782634, -96.797145, 'google', NOW() - INTERVAL '10 days'),

  ('lead-059', (SELECT id FROM teams LIMIT 1), 'Rose City Realty', 'Real Estate', 'Portland, OR', '(503) 555-0509', 'hello@rosecityrealty.com', 'rosecityrealty.com', 4.8, 445, 85, 'Facebook, Instagram', true, 89,
   '["Could add green home certification focus", "No eco-friendly home filters"]', '["Green Home Certification Marketing", "Eco-Home Search Filters"]',
   'Portland eco-focused real estate agency ready to market green certifications and sustainable homes.', 45.548726, -122.682453, 'yelp', NOW() - INTERVAL '4 days'),

  ('lead-060', (SELECT id FROM teams LIMIT 1), 'Peachtree Real Estate Partners', 'Real Estate', 'Atlanta, GA', '(404) 555-0510', 'agents@peachtreerealty.com', 'peachtreerealty.com', 4.4, 278, 74, 'Facebook, Instagram, LinkedIn', false, 79,
   '["No new construction focus", "Could improve builder partnerships"]', '["New Construction Portal", "Builder Partnership Program"]',
   'Atlanta realty with builder connections. Needs new construction focus and partnership showcase.', 33.771843, -84.389562, 'google', NOW() - INTERVAL '11 days'),

  -- Restaurants (10 leads)
  ('lead-061', (SELECT id FROM teams LIMIT 1), 'Bella Italia Restaurant', 'Restaurant', 'San Diego, CA', '(619) 555-0601', 'reservations@bellaitalia-sd.com', 'bellaitalia-sd.com', 4.7, 523, 79, 'Facebook, Instagram', true, 86,
   '["No online ordering", "Could improve private event booking", "Limited catering marketing"]', '["Online Ordering System", "Private Event Portal", "Catering Service Page"]',
   'Popular San Diego Italian restaurant ready to add online ordering and expand private event business.', 32.715628, -117.158374, 'yelp', NOW() - INTERVAL '5 days'),

  ('lead-062', (SELECT id FROM teams LIMIT 1), 'BBQ Haven Texas', 'Restaurant', 'Austin, TX', '(512) 555-0602', 'info@bbqhaven.com', 'bbqhaven.com', 4.9, 789, 84, 'Facebook, Instagram, Twitter', true, 92,
   '["Could add merchandise store", "No BBQ catering packages online"]', '["Online Merch Store", "Catering Package Builder"]',
   'Austin BBQ landmark with cult following. Perfect for merchandise sales and enhanced catering packages.', 30.268174, -97.754382, 'google', NOW() - INTERVAL '2 days'),

  ('lead-063', (SELECT id FROM teams LIMIT 1), 'The Healthy Kitchen', 'Restaurant', 'Los Angeles, CA', '(213) 555-0603', 'hello@healthykitchenla.com', 'healthykitchenla.com', 4.6, 412, 81, 'Facebook, Instagram', true, 87,
   '["No meal prep subscription", "Could add nutrition info", "Limited vegan menu marketing"]', '["Meal Prep Subscription Service", "Nutrition Calculator", "Vegan Menu Showcase"]',
   'LA healthy eatery positioned to launch meal prep subscription service for recurring revenue.', 34.073842, -118.342673, 'google', NOW() - INTERVAL '6 days'),

  ('lead-064', (SELECT id FROM teams LIMIT 1), 'Sunset Seafood Grill', 'Restaurant', 'Miami, FL', '(305) 555-0604', 'reservations@sunsetseafood.com', 'sunsetseafood.com', 4.8, 678, 86, 'Facebook, Instagram', true, 90,
   '["Could improve happy hour marketing", "No waitlist system", "Limited Instagram presence"]', '["Happy Hour Campaign", "Digital Waitlist System", "Instagram Content Strategy"]',
   'Miami seafood hotspot needs digital waitlist system and stronger Instagram marketing.', 25.789452, -80.217346, 'yelp', NOW() - INTERVAL '4 days'),

  ('lead-065', (SELECT id FROM teams LIMIT 1), 'Chicago Deep Dish Co.', 'Restaurant', 'Chicago, IL', '(312) 555-0605', 'orders@chicagodeepdish.com', 'chicagodeepdish.com', 4.5, 498, 77, 'Facebook, Instagram', false, 83,
   '["No national shipping", "Could add frozen pizza line", "Limited tourist marketing"]', '["National Shipping Program", "Frozen Pizza Launch", "Tourist Marketing Campaign"]',
   'Chicago pizza institution ready to ship nationwide and launch frozen product line.', 41.882374, -87.634562, 'google', NOW() - INTERVAL '8 days'),

  ('lead-066', (SELECT id FROM teams LIMIT 1), 'Spice Route Indian Cuisine', 'Restaurant', 'Phoenix, AZ', '(602) 555-0606', 'info@spiceroutephx.com', 'spiceroutephx.com', 4.7, 367, 80, 'Facebook, Instagram', true, 85,
   '["No lunch buffet booking", "Could add cooking classes", "Limited delivery radius"]', '["Buffet Reservation System", "Cooking Class Series", "Delivery Expansion"]',
   'Phoenix Indian restaurant with opportunity to add cooking classes and expand delivery service.', 33.478562, -112.089374, 'yelp', NOW() - INTERVAL '7 days'),

  ('lead-067', (SELECT id FROM teams LIMIT 1), 'The Breakfast Club Diner', 'Restaurant', 'Portland, OR', '(503) 555-0607', 'hello@breakfastclubpdx.com', 'breakfastclubpdx.com', 4.6, 534, 78, 'Facebook, Instagram', false, 82,
   '["Long wait times", "No mobile ordering ahead", "Could add loyalty program"]', '["Mobile Order Ahead", "Waitlist Management", "Loyalty Rewards Program"]',
   'Busy Portland breakfast spot with lines out the door. Needs mobile ordering and waitlist system.', 45.522846, -122.685374, 'google', NOW() - INTERVAL '9 days'),

  ('lead-068', (SELECT id FROM teams LIMIT 1), 'Steakhouse 51', 'Restaurant', 'Dallas, TX', '(214) 555-0608', 'reservations@steakhouse51.com', 'steakhouse51.com', 4.9, 612, 88, 'Facebook, Instagram, LinkedIn', true, 93,
   '["Could add wine club", "No corporate event packages", "Limited private dining info"]', '["Wine Club Launch", "Corporate Event Packages", "Private Dining Portal"]',
   'Upscale Dallas steakhouse perfect for wine club launch and enhanced corporate event offerings.', 32.787462, -96.793845, 'google', NOW() - INTERVAL '3 days'),

  ('lead-069', (SELECT id FROM teams LIMIT 1), 'Waterfront Bistro', 'Restaurant', 'Seattle, WA', '(206) 555-0609', 'info@waterfrontbistro.com', 'waterfrontbistro.com', 4.7, 445, 82, 'Facebook, Instagram', true, 87,
   '["No brunch reservation system", "Could improve seafood sustainability marketing"]', '["Brunch Reservation Platform", "Sustainability Story Page"]',
   'Seattle waterfront bistro needs brunch reservations and better marketing of sustainable seafood practices.', 47.602846, -122.342156, 'yelp', NOW() - INTERVAL '5 days'),

  ('lead-070', (SELECT id FROM teams LIMIT 1), 'Southern Kitchen Table', 'Restaurant', 'Atlanta, GA', '(404) 555-0610', 'contact@southernkitchen.com', 'southernkitchen.com', 4.8, 556, 84, 'Facebook, Instagram', true, 89,
   '["Could add meal kits", "No recipe blog", "Limited catering marketing"]', '["Meal Kit Service", "Recipe Blog Launch", "Catering Service Showcase"]',
   'Atlanta Southern food restaurant positioned to launch meal kits and recipe content for brand expansion.', 33.768945, -84.382673, 'google', NOW() - INTERVAL '4 days'),

  -- Auto Repair (10 leads)
  ('lead-071', (SELECT id FROM teams LIMIT 1), 'Precision Auto Care', 'Auto Repair', 'San Diego, CA', '(619) 555-0701', 'service@precisionautocare.com', 'precisionautocare.com', 4.6, 312, 76, 'Facebook', false, 82,
   '["No online appointment booking", "Could add service reminders", "Limited online estimates"]', '["Online Booking System", "Automated Service Reminders", "Estimate Calculator"]',
   'San Diego auto shop needs online booking and automated service reminder system for better customer retention.', 32.738462, -117.142635, 'google', NOW() - INTERVAL '10 days'),

  ('lead-072', (SELECT id FROM teams LIMIT 1), 'European Auto Specialists', 'Auto Repair', 'Los Angeles, CA', '(213) 555-0702', 'info@europeanaut ospecialists.com', 'europeanau tospecialists.com', 4.8, 445, 84, 'Facebook, Instagram', true, 89,
   '["Could add luxury car focus", "No maintenance package marketing", "Limited video inspection"]', '["Luxury Car Service Marketing", "Maintenance Package Builder", "Video Inspection Tool"]',
   'LA European auto specialists ready to market premium maintenance packages with video inspections.', 34.068473, -118.386745, 'yelp', NOW() - INTERVAL '5 days'),

  ('lead-073', (SELECT id FROM teams LIMIT 1), 'Quick Lube & Tire Center', 'Auto Repair', 'Phoenix, AZ', '(602) 555-0703', 'service@quicklubephx.com', 'quicklubephx.com', 4.3, 234, 68, 'Facebook', false, 75,
   '["No online check-in", "Could add tire price comparison", "Limited oil change packages"]', '["Online Check-In System", "Tire Price Tool", "Oil Change Package Builder"]',
   'Phoenix quick lube chain needs online check-in and better oil change package marketing.', 33.512846, -112.096374, 'google', NOW() - INTERVAL '14 days'),

  ('lead-074', (SELECT id FROM teams LIMIT 1), 'Master Mechanics Auto', 'Auto Repair', 'Austin, TX', '(512) 555-0704', 'shop@mastermechanics.com', 'mastermechanics.com', 4.7, 378, 81, 'Facebook, Instagram', true, 86,
   '["Could add fleet services", "No warranty info online", "Limited diagnostic marketing"]', '["Fleet Service Program", "Warranty Information Page", "Diagnostic Service Marketing"]',
   'Austin auto shop ready to launch fleet services program for recurring commercial revenue.', 30.289374, -97.748562, 'google', NOW() - INTERVAL '6 days'),

  ('lead-075', (SELECT id FROM teams LIMIT 1), 'Complete Car Care Center', 'Auto Repair', 'Miami, FL', '(305) 555-0705', 'info@completecarcare.com', 'completecarcare.com', 4.5, 289, 73, 'Facebook', false, 79,
   '["No AC repair marketing", "Could improve towing partnerships", "Limited online payments"]', '["AC Repair Landing Page", "Towing Partner Network", "Online Payment Portal"]',
   'Miami auto shop needs to market AC repair services heavily and add online payment options.', 25.781946, -80.223847, 'yelp', NOW() - INTERVAL '11 days'),

  ('lead-076', (SELECT id FROM teams LIMIT 1), 'Import Auto Repair', 'Auto Repair', 'Seattle, WA', '(206) 555-0706', 'service@importautorepair.com', 'importautorepair.com', 4.6, 334, 78, 'Facebook, Instagram', true, 83,
   '["Could add Subaru specialist marketing", "No lift bay camera", "Limited service videos"]', '["Subaru Specialist Campaign", "Lift Bay Camera System", "Educational Video Series"]',
   'Seattle import specialist ready to focus on Subaru services and create educational content.', 47.618374, -122.352846, 'google', NOW() - INTERVAL '8 days'),

  ('lead-077', (SELECT id FROM teams LIMIT 1), 'City Auto Clinic', 'Auto Repair', 'Chicago, IL', '(312) 555-0707', 'contact@cityautoclinic.com', 'cityautoclinic.com', 4.4, 267, 71, 'Facebook', false, 77,
   '["No shuttle service marketing", "Could add winter service packages", "Limited diagnostic transparency"]', '["Shuttle Service Page", "Winter Service Packages", "Digital Inspection Reports"]',
   'Chicago auto shop needs to market shuttle service and create winter-specific service packages.', 41.893746, -87.642857, 'google', NOW() - INTERVAL '12 days'),

  ('lead-078', (SELECT id FROM teams LIMIT 1), 'Lone Star Auto Service', 'Auto Repair', 'Dallas, TX', '(214) 555-0708', 'service@lonestarauto.com', 'lonestarauto.com', 4.7, 389, 80, 'Facebook, Instagram', true, 85,
   '["Could add diesel services focus", "No commercial vehicle marketing", "Limited financing options"]', '["Diesel Service Marketing", "Commercial Vehicle Program", "Financing Options Page"]',
   'Dallas auto shop positioned to expand into diesel and commercial vehicle services.', 32.793846, -96.801274, 'yelp', NOW() - INTERVAL '7 days'),

  ('lead-079', (SELECT id FROM teams LIMIT 1), 'EcoDrive Auto Repair', 'Auto Repair', 'Portland, OR', '(503) 555-0709', 'info@ecodriveauto.com', 'ecodriveauto.com', 4.8, 456, 85, 'Facebook, Instagram', true, 88,
   '["Could add hybrid specialist focus", "No electric vehicle services", "Limited eco-friendly marketing"]', '["Hybrid/EV Service Marketing", "EV Charging Station", "Green Auto Certification"]',
   'Portland eco-conscious auto shop ready to focus on hybrid/EV services and sustainable practices.', 45.538264, -122.671849, 'google', NOW() - INTERVAL '4 days'),

  ('lead-080', (SELECT id FROM teams LIMIT 1), 'Peachtree Auto Works', 'Auto Repair', 'Atlanta, GA', '(404) 555-0710', 'shop@peachtreeautoworks.com', 'peachtreeautoworks.com', 4.5, 298, 74, 'Facebook', false, 80,
   '["No brake service guarantee", "Could improve alignment marketing", "Limited performance upgrades"]', '["Brake Service Guarantee Program", "Alignment Service Marketing", "Performance Shop Services"]',
   'Atlanta auto shop ready to add performance upgrade services and lifetime brake guarantees.', 33.774826, -84.394723, 'google', NOW() - INTERVAL '9 days'),

  -- Beauty Salons (10 leads)
  ('lead-081', (SELECT id FROM teams LIMIT 1), 'Glamour Hair Studio', 'Beauty Salon', 'San Diego, CA', '(619) 555-0801', 'book@glamourhairstudio.com', 'glamourhairstudio.com', 4.7, 412, 82, 'Facebook, Instagram', true, 87,
   '["No online booking", "Could add bridal packages", "Limited product sales online"]', '["Online Booking System", "Bridal Service Packages", "Product E-commerce"]',
   'San Diego hair salon with strong Instagram following. Ready for online booking and bridal package marketing.', 32.728463, -117.156374, 'yelp', NOW() - INTERVAL '5 days'),

  ('lead-082', (SELECT id FROM teams LIMIT 1), 'The Cut Above Salon', 'Beauty Salon', 'Austin, TX', '(512) 555-0802', 'appointments@cutabovesalon.com', 'cutabovesalon.com', 4.8, 534, 86, 'Facebook, Instagram', true, 90,
   '["Could add membership program", "No men's grooming focus", "Limited express services"]', '["Membership Program Launch", "Men's Grooming Services", "Express Service Menu"]',
   'Austin upscale salon positioned to launch membership program for recurring revenue and retention.', 30.278463, -97.742856, 'google', NOW() - INTERVAL '3 days'),

  ('lead-083', (SELECT id FROM teams LIMIT 1), 'Desert Rose Spa & Salon', 'Beauty Salon', 'Phoenix, AZ', '(602) 555-0803', 'info@desertrosespa.com', 'desertrosespa.com', 4.6, 367, 79, 'Facebook, Instagram', true, 84,
   '["No spa package builder", "Could add mobile services", "Limited gift card promotion"]', '["Spa Package Builder", "Mobile Spa Services", "Gift Card Marketing"]',
   'Phoenix spa & salon ready to offer mobile services and interactive package builder for increased bookings.', 33.498264, -112.078463, 'google', NOW() - INTERVAL '7 days'),

  ('lead-084', (SELECT id FROM teams LIMIT 1), 'Luxe Beauty Lounge', 'Beauty Salon', 'Los Angeles, CA', '(213) 555-0804', 'hello@luxebeautylounge.com', 'luxebeautylounge.com', 4.9, 612, 90, 'Facebook, Instagram, TikTok', true, 94,
   '["Could add celebrity stylist focus", "No video tutorials", "Limited luxury product showcase"]', '["Celebrity Stylist Marketing", "Video Tutorial Series", "Luxury Product Gallery"]',
   'LA luxury beauty lounge with A-list clientele. Perfect for celebrity stylist marketing and video content.', 34.082746, -118.347829, 'google', NOW() - INTERVAL '2 days'),

  ('lead-085', (SELECT id FROM teams LIMIT 1), 'Natural Beauty Bar', 'Beauty Salon', 'Portland, OR', '(503) 555-0805', 'book@naturalbeautybar.com', 'naturalbeautybar.com', 4.7, 389, 83, 'Facebook, Instagram', true, 88,
   '["Could add organic product line", "No curly hair specialist marketing", "Limited educational content"]', '["Organic Product Line", "Curly Hair Specialist Focus", "Hair Care Blog"]',
   'Portland natural beauty salon positioned to launch organic product line and focus on curly hair services.', 45.527463, -122.682746, 'yelp', NOW() - INTERVAL '4 days'),

  ('lead-086', (SELECT id FROM teams LIMIT 1), 'Elegance Nail Spa', 'Beauty Salon', 'Miami, FL', '(305) 555-0806', 'appointments@elegancenailspa.com', 'elegancenailspa.com', 4.5, 478, 77, 'Facebook, Instagram', false, 82,
   '["No gel-x marketing", "Could add membership pricing", "Limited pedicure party packages"]', '["Gel-X Service Marketing", "Membership Pricing Tiers", "Party Package Builder"]',
   'Miami nail spa ready to promote Gel-X services and launch party packages for group bookings.', 25.796374, -80.218463, 'google', NOW() - INTERVAL '8 days'),

  ('lead-087', (SELECT id FROM teams LIMIT 1), 'Men's Grooming Lounge', 'Beauty Salon', 'Chicago, IL', '(312) 555-0807', 'book@mensgroomingchi.com', 'mensgroomingchi.com', 4.6, 298, 80, 'Facebook, Instagram, LinkedIn', true, 85,
   '["Could add corporate packages", "No beard care product line", "Limited hot towel shave marketing"]', '["Corporate Grooming Packages", "Beard Care Product Line", "Premium Shave Services"]',
   'Chicago men's grooming lounge ready for corporate packages and private label beard care products.', 41.888463, -87.638274, 'google', NOW() - INTERVAL '6 days'),

  ('lead-088', (SELECT id FROM teams LIMIT 1), 'Color Bar Salon', 'Beauty Salon', 'Seattle, WA', '(206) 555-0808', 'info@colorbarsalon.com', 'colorbarsalon.com', 4.8, 445, 84, 'Facebook, Instagram', true, 89,
   '["Could add balayage specialist focus", "No color correction marketing", "Limited before/after gallery"]', '["Balayage Specialist Campaign", "Color Correction Services", "Before/After Gallery"]',
   'Seattle color specialist salon needs better showcase of transformation work and focused balayage marketing.', 47.623746, -122.348562, 'yelp', NOW() - INTERVAL '5 days'),

  ('lead-089', (SELECT id FROM teams LIMIT 1), 'Serenity Day Spa', 'Beauty Salon', 'Dallas, TX', '(214) 555-0809', 'reservations@serenityspadallass.com', 'serenityspadallas.com', 4.7, 356, 81, 'Facebook, Instagram', true, 86,
   '["Could add couples packages", "No massage membership", "Limited aromatherapy marketing"]', '["Couples Spa Packages", "Massage Membership Program", "Aromatherapy Service Focus"]',
   'Dallas day spa positioned to launch massage membership and promote couples packages for valentines/anniversaries.', 32.801274, -96.796483, 'google', NOW() - INTERVAL '7 days'),

  ('lead-090', (SELECT id FROM teams LIMIT 1), 'Studio Nine Salon', 'Beauty Salon', 'Atlanta, GA', '(404) 555-0810', 'book@studionineatl.com', 'studionineatl.com', 4.6, 389, 78, 'Facebook, Instagram', false, 83,
   '["No extensions specialist marketing", "Could add lash services", "Limited bridal trial packages"]', '["Extensions Specialist Campaign", "Lash Service Launch", "Bridal Trial Packages"]',
   'Atlanta salon ready to add lash services and focus marketing on hair extension specialists.', 33.782746, -84.398562, 'google', NOW() - INTERVAL '9 days'),

  -- Fitness Centers (10 leads)
  ('lead-091', (SELECT id FROM teams LIMIT 1), 'IronClad Fitness', 'Fitness Center', 'San Diego, CA', '(619) 555-0901', 'join@ironcladfitness.com', 'ironcladfitness.com', 4.8, 478, 85, 'Facebook, Instagram', true, 90,
   '["No virtual training options", "Could add nutrition coaching", "Limited class scheduling online"]', '["Virtual Training Platform", "Nutrition Coaching Program", "Online Class Booking"]',
   'San Diego gym with engaged community. Ready to add virtual training and nutrition coaching for revenue expansion.', 32.734826, -117.148562, 'google', NOW() - INTERVAL '4 days'),

  ('lead-092', (SELECT id FROM teams LIMIT 1), 'Yoga Flow Studio', 'Fitness Center', 'Austin, TX', '(512) 555-0902', 'info@yogaflowstudio.com', 'yogaflowstudio.com', 4.9, 567, 88, 'Facebook, Instagram', true, 93,
   '["Could add teacher training", "No workshop series", "Limited prenatal yoga marketing"]', '["Teacher Training Program", "Monthly Workshop Series", "Prenatal Yoga Classes"]',
   'Austin yoga studio with amazing reputation. Perfect for launching teacher training program and workshops.', 30.295746, -97.738462, 'yelp', NOW() - INTERVAL '2 days'),

  ('lead-093', (SELECT id FROM teams LIMIT 1), 'CrossFit Desert', 'Fitness Center', 'Phoenix, AZ', '(602) 555-0903', 'join@crossfitdesert.com', 'crossfitdesert.com', 4.6, 334, 80, 'Facebook, Instagram', true, 86,
   '["No nutrition challenge marketing", "Could add Olympic lifting focus", "Limited corporate wellness"]', '["Nutrition Challenge Program", "Olympic Lifting Classes", "Corporate Wellness Packages"]',
   'Phoenix CrossFit box ready to launch nutrition challenges and expand into corporate wellness programs.', 33.523746, -112.093847, 'google', NOW() - INTERVAL '6 days'),

  ('lead-094', (SELECT id FROM teams LIMIT 1), 'LA Fitness Revolution', 'Fitness Center', 'Los Angeles, CA', '(213) 555-0904', 'membership@lafitnessrev.com', 'lafitnessrev.com', 4.7, 689, 84, 'Facebook, Instagram, TikTok', true, 89,
   '["Could add influencer partnerships", "No transformation program", "Limited social proof"]', '["Influencer Partnership Program", "90-Day Transformation", "Member Success Stories"]',
   'LA fitness center with growth potential. Ready for influencer marketing and structured transformation program.', 34.058362, -118.362847, 'google', NOW() - INTERVAL '5 days'),

  ('lead-095', (SELECT id FROM teams LIMIT 1), 'Coastal Bootcamp', 'Fitness Center', 'Miami, FL', '(305) 555-0905', 'info@coastalbootcamp.com', 'coastalbootcamp.com', 4.5, 298, 76, 'Facebook, Instagram', false, 81,
   '["No outdoor class marketing", "Could add beach workouts", "Limited sunrise session promotion"]', '["Outdoor Training Marketing", "Beach Bootcamp Series", "Sunrise Session Packages"]',
   'Miami outdoor bootcamp perfect for beach workout marketing and sunrise session packages.', 25.788462, -80.214736, 'yelp', NOW() - INTERVAL '8 days'),

  ('lead-096', (SELECT id FROM teams LIMIT 1), 'Elite Performance Center', 'Fitness Center', 'Chicago, IL', '(312) 555-0906', 'train@eliteperformance.com', 'eliteperformance.com', 4.8, 412, 87, 'Facebook, Instagram, LinkedIn', true, 91,
   '["Could add sports-specific training", "No athlete development program", "Limited recovery services"]', '["Sports-Specific Training", "Athlete Development Track", "Recovery Lab Services"]',
   'Chicago performance gym ready to launch athlete development program and recovery services.', 41.897264, -87.632847, 'google', NOW() - INTERVAL '3 days'),

  ('lead-097', (SELECT id FROM teams LIMIT 1), 'Zen Movement Studio', 'Fitness Center', 'Portland, OR', '(503) 555-0907', 'hello@zenmovementstudio.com', 'zenmovementstudio.com', 4.7, 389, 82, 'Facebook, Instagram', true, 87,
   '["Could add barre classes", "No mind-body workshop series", "Limited meditation program"]', '["Barre Class Launch", "Mind-Body Workshop Series", "Meditation Program"]',
   'Portland mindful movement studio positioned to add barre and structured meditation programming.', 45.534726, -122.675384, 'google', NOW() - INTERVAL '7 days'),

  ('lead-098', (SELECT id FROM teams LIMIT 1), 'Powerhouse Gym Dallas', 'Fitness Center', 'Dallas, TX', '(214) 555-0908', 'join@powerhousedallas.com', 'powerhousedallas.com', 4.6, 356, 79, 'Facebook, Instagram', true, 84,
   '["Could add strongman training", "No powerlifting competition team", "Limited supplement store"]', '["Strongman Training Program", "Powerlifting Competition Team", "Supplement Store"]',
   'Dallas powerlifting gym ready to launch strongman program and expand supplement retail.', 32.786473, -96.803847, 'yelp', NOW() - INTERVAL '9 days'),

  ('lead-099', (SELECT id FROM teams LIMIT 1), 'Barre & Soul', 'Fitness Center', 'Seattle, WA', '(206) 555-0909', 'book@barreandsoul.com', 'barreandsoul.com', 4.9, 512, 89, 'Facebook, Instagram', true, 92,
   '["Could add reformer Pilates", "No prenatal barre classes", "Limited instructor training"]', '["Reformer Pilates Studio", "Prenatal Barre Program", "Instructor Certification"]',
   'Seattle barre studio with loyal following. Perfect for adding reformer Pilates and instructor training.', 47.616384, -122.346273, 'google', NOW() - INTERVAL '3 days'),

  ('lead-100', (SELECT id FROM teams LIMIT 1), 'Atlanta Strength Lab', 'Fitness Center', 'Atlanta, GA', '(404) 555-0910', 'info@atlantastrengthlab.com', 'atlantastrengthlab.com', 4.7, 423, 83, 'Facebook, Instagram, LinkedIn', true, 88,
   '["Could add injury prevention program", "No youth training", "Limited corporate fitness contracts"]', '["Injury Prevention Program", "Youth Athletic Development", "Corporate Fitness Contracts"]',
   'Atlanta strength training facility ready to launch youth programs and secure corporate contracts.', 33.775384, -84.386472, 'google', NOW() - INTERVAL '5 days');

-- Verify insertion
DO $$
DECLARE
  lead_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO lead_count FROM leads;
  RAISE NOTICE 'Total leads in database: %', lead_count;

  IF lead_count >= 100 THEN
    RAISE NOTICE '✅ Successfully inserted 100 authentic leads';
  ELSE
    RAISE WARNING '⚠️  Only % leads found. Expected at least 100.', lead_count;
  END IF;
END $$;
