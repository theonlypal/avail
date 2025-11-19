# LEADLY.AI HOMEPAGE, DASHBOARD & DEMOS REBUILD

## 🎯 MISSION: PRODUCTION-GRADE REBUILD

Transform LEADLY.AI from demo showcase to **production-ready AI services platform** with accurate company information, real integrations, and industry-leading UI.

---

## 📋 SCOPE OF WORK

### 1. HOMEPAGE REBUILD ✅
**Goal**: Accurate representation of LEADLY.AI as an AI services company

**Current Issues**:
- Generic content focused only on lead generation
- No clear value proposition for AI services
- Missing company information and credibility markers
- No visual hierarchy or compelling CTAs

**New Requirements**:
- **Hero Section**: Clear positioning as AI services platform
  - Headline: What LEADLY.AI does (AI-powered business automation)
  - Subheadline: Who it's for (SMBs, agencies, enterprises)
  - Primary CTA: "See Demos" / "Get Started"
  - Visual: Hero image/animation showing AI in action

- **Services Section**: 6 core AI services with icons
  1. **AI Lead Generation** - Capture & qualify leads 24/7
  2. **AI Customer Support** - Intelligent chatbots & helpdesk
  3. **AI Sales Automation** - Follow-up, nurturing, closing
  4. **AI Appointment Scheduling** - Smart calendar management
  5. **AI Review Management** - Monitor & respond to reviews
  6. **AI Social Media** - Content generation & engagement

- **How It Works**: 3-step process
  1. Connect your data sources
  2. AI learns your business
  3. Automation runs 24/7

- **Social Proof**: Stats, testimonials, trust badges
  - "10,000+ leads captured"
  - "50+ businesses automated"
  - "24/7 AI availability"

- **Demo Showcase**: Featured demos with screenshots
  - ProPlumb HVAC live website integration
  - Calendar booking demo
  - CRM integration demo

- **Pricing Teaser**: "Plans starting at $X/month" → link to pricing page

- **Footer**: Company info, links, contact

---

### 2. DASHBOARD CLEANUP ✅
**Goal**: Professional, actionable dashboard for existing customers

**Current Issues**:
- Cluttered with demo content
- No clear separation between demos and actual features
- Missing real business metrics

**New Requirements**:
- **Welcome Banner**: Personalized greeting with quick actions
- **Key Metrics**: 4 cards showing real business data
  - Total leads captured (this month)
  - AI conversations handled
  - Appointments scheduled
  - Revenue impact estimate

- **Recent Activity Feed**: Last 10 AI interactions
  - Lead captured
  - Conversation completed
  - Appointment booked
  - Review responded to

- **Quick Actions**:
  - "View All Leads"
  - "Configure AI"
  - "See Analytics"
  - "Explore Demos"

- **Demo Section**: Clearly separated
  - Card-based layout
  - "Explore Demos" heading
  - 6 demo cards with thumbnails

---

### 3. DEMOS REBUILD - FULL INTEGRATION ✅

#### 3A. ProPlumb Website Demo (AI Chat Integration)
**File**: `/demos-live/website`

**New Requirements**:
- **Real Website Layout**: Professional HVAC company website
  - Hero: "Emergency HVAC Services - 24/7"
  - Services: Heating, Cooling, Maintenance, Emergency
  - About section, Contact info
  - **Real Images**: HVAC equipment, technicians (use Unsplash API)

- **AI Chatbot**: EMBEDDED in website (bottom-right)
  - Floating chat button: "Need Help? Chat with our AI"
  - Opens chat window overlay
  - Real conversation flow:
    - "Hi! I'm the ProPlumb AI assistant. How can I help?"
    - User: "I need AC repair"
    - AI: "I can help! What's your address?" (lead capture)
    - AI: "When works best for you?" (scheduling)
    - AI: "Got it! [Name] will call you at [time]"
  - Visual chat UI with typing indicators
  - Lead capture form integration

- **Demo Controls**: Admin panel showing:
  - "Chat initiated"
  - "Lead captured: John Doe"
  - "Qualification score: 85%"
  - Real-time metrics

#### 3B. Calendar/Booking Demo
**File**: `/demos/calendar` or `/demos-live/calendar`

**New Requirements**:
- **Real Calendar UI**: Full-featured booking interface
  - Month/week view calendar component
  - Time slot selection
  - Service type dropdown (Consultation, Repair, Maintenance)
  - Contact information form

- **AI Integration**: Smart scheduling
  - "AI suggests best times based on your availability"
  - Auto-detects timezone
  - Sends confirmation email (simulated)
  - Calendar invite generation

- **Demo Metrics**:
  - "15 appointments scheduled this week"
  - "92% show-up rate"
  - "3 hours saved on phone calls"

#### 3C. CRM Integration Demo
**File**: `/demos/crm`

**New Requirements**:
- **Real CRM Interface**:
  - Lead pipeline: Kanban board (New → Contacted → Qualified → Closed)
  - Lead cards with avatars, scores, last contact
  - Drag-and-drop functionality
  - Filter/search bar

- **AI Features**:
  - "AI Lead Scoring" badge on each lead
  - "Suggested next action" button
  - Auto-categorization by industry
  - Sentiment analysis on notes

- **Integration Demos**: Show connectors
  - Salesforce logo + "Connected"
  - HubSpot logo + "Connected"
  - Pipedrive logo + "Connected"

#### 3D. SMS Automation Demo
**File**: `/demos/sms`

**New Requirements**:
- **SMS Thread UI**: iPhone-style message interface
  - Conversation thread with customer
  - AI-generated messages highlighted
  - Delivery timestamps
  - Read receipts

- **Campaign Builder**:
  - "Welcome series" template
  - "Follow-up after no-show" template
  - "Re-engagement campaign" template
  - Visual workflow builder

- **Metrics**:
  - "1,247 messages sent"
  - "68% response rate"
  - "312 conversations started"

#### 3E. Review Management Demo
**File**: `/demos/reviews`

**New Requirements**:
- **Review Dashboard**:
  - Star rating overview (4.7/5 avg)
  - Recent reviews from Google, Yelp, Facebook
  - Review cards with customer avatars
  - Sentiment badges (Positive, Neutral, Negative)

- **AI Response Generator**:
  - "Generate response" button
  - Shows AI-written reply
  - Tone selector (Professional, Friendly, Apologetic)
  - One-click publish

- **Analytics**:
  - Rating trend graph
  - Response time: "Average 15 minutes"
  - "AI responded to 94% of reviews"

#### 3F. Social Media Demo
**File**: `/demos/social`

**New Requirements**:
- **Content Calendar**: Visual calendar grid
  - Scheduled posts with thumbnails
  - Platform icons (FB, IG, Twitter, LinkedIn)
  - Post status: Published, Scheduled, Draft

- **AI Post Generator**:
  - Topic input: "New product launch"
  - AI generates post with image suggestion
  - Platform-specific formatting
  - Hashtag recommendations

- **Performance Metrics**:
  - Total reach: "125K impressions"
  - Engagement rate: "8.2%"
  - "AI-generated posts perform 34% better"

#### 3G. Advertising Demo
**File**: `/demos/ads`

**New Requirements**:
- **Campaign Dashboard**:
  - Active campaigns table
  - Budget, spend, impressions, conversions
  - Visual performance graphs

- **AI Ad Generator**:
  - Business info input
  - AI generates ad copy (3 variants)
  - Image suggestions
  - Audience targeting recommendations

- **ROI Calculator**:
  - Input: Budget, expected conversion rate
  - Output: Projected leads, revenue
  - "With AI optimization: +45% ROI"

---

## 🎨 DESIGN SYSTEM REQUIREMENTS

### Visual Design
- **Images**: Use Unsplash API for all demo images
  - HVAC equipment for ProPlumb
  - Business professionals for CRM
  - Smartphones for SMS demo
  - Social media mockups for Social demo

### Color Palette
- Primary: Keep existing brand colors
- Use accent colors for demo-specific branding
- Dark mode support throughout

### Typography
- Headlines: Bold, clear hierarchy
- Body: Readable, professional
- Code/metrics: Monospace font

### Spacing & Layout
- Consistent padding (24px, 32px, 48px)
- Card-based layouts for demos
- Grid system for responsive design

### Components to Build
1. **DemoCard**: Reusable demo preview card
2. **ChatWidget**: Embeddable AI chatbot
3. **CalendarPicker**: Full calendar component
4. **KanbanBoard**: Drag-drop CRM board
5. **MessageThread**: SMS conversation UI
6. **ReviewCard**: Review display component
7. **SocialPostCard**: Social media post preview
8. **MetricsCard**: Data visualization card

---

## 📁 FILE STRUCTURE

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # NEW HOMEPAGE
│   │   ├── about/page.tsx              # About LEADLY.AI
│   │   └── pricing/page.tsx            # Pricing page
│   ├── (app)/
│   │   ├── dashboard/page.tsx          # CLEANED UP DASHBOARD
│   │   ├── demos/
│   │   │   ├── page.tsx                # Demos overview
│   │   │   ├── website/page.tsx        # Live website (no changes)
│   │   │   ├── calendar/page.tsx       # NEW: Full calendar
│   │   │   ├── crm/page.tsx            # ENHANCED: Real CRM
│   │   │   ├── sms/page.tsx            # ENHANCED: SMS threads
│   │   │   ├── reviews/page.tsx        # ENHANCED: Review mgmt
│   │   │   ├── social/page.tsx         # ENHANCED: Social calendar
│   │   │   └── ads/page.tsx            # ENHANCED: Ad campaigns
│   │   └── demos-live/
│   │       ├── website/page.tsx        # EMBEDDED chatbot version
│   │       └── calendar/page.tsx       # NEW: Live calendar demo
├── components/
│   ├── marketing/
│   │   ├── hero-section.tsx            # Homepage hero
│   │   ├── services-grid.tsx           # 6 AI services
│   │   ├── how-it-works.tsx            # 3-step process
│   │   └── demo-showcase.tsx           # Featured demos
│   ├── demos/
│   │   ├── chat-widget.tsx             # Embeddable chatbot
│   │   ├── calendar-picker.tsx         # Full calendar
│   │   ├── kanban-board.tsx            # CRM board
│   │   ├── message-thread.tsx          # SMS UI
│   │   ├── review-card.tsx             # Review display
│   │   ├── social-post-card.tsx        # Social post
│   │   └── demo-controls.tsx           # Admin controls
│   └── dashboard/
│       ├── metrics-grid.tsx            # 4 key metrics
│       ├── activity-feed.tsx           # Recent activity
│       └── quick-actions.tsx           # Action buttons
└── lib/
    └── unsplash.ts                     # Unsplash API integration
```

---

## 🚀 EXECUTION PLAN

### Phase 1: Homepage Rebuild
1. Create marketing layout route group
2. Build hero section with company positioning
3. Build services grid (6 AI services)
4. Build how-it-works section
5. Build demo showcase with screenshots
6. Build social proof section
7. Build footer with company info

### Phase 2: Dashboard Cleanup
1. Redesign dashboard with clear sections
2. Build metrics cards (real business data)
3. Build activity feed component
4. Build quick actions panel
5. Separate demos into distinct section

### Phase 3: Demo Components
1. Build ChatWidget component
2. Build CalendarPicker component
3. Build KanbanBoard component
4. Build MessageThread component
5. Build ReviewCard component
6. Build SocialPostCard component
7. Build DemoControls component

### Phase 4: Demo Pages - Full Integration
1. ProPlumb website with embedded chat
2. Calendar booking with real UI
3. CRM with drag-drop board
4. SMS with thread interface
5. Reviews with AI responses
6. Social with content calendar
7. Ads with campaign dashboard

### Phase 5: Images & Polish
1. Integrate Unsplash API
2. Add images to all demos
3. Add loading states
4. Add empty states
5. Add success animations
6. Test responsive design
7. Cross-browser testing

---

## ✅ SUCCESS CRITERIA

- [ ] Homepage accurately represents LEADLY.AI services
- [ ] Dashboard is clean, professional, actionable
- [ ] All 7 demos have real, functional UIs
- [ ] AI chatbot is embedded in website demo
- [ ] Calendar demo has actual calendar component
- [ ] CRM demo has drag-drop functionality
- [ ] All demos have appropriate images
- [ ] All pages are responsive
- [ ] All pages have loading/empty states
- [ ] All pages follow design system
- [ ] Navigation is clear and intuitive
- [ ] Performance is optimized (< 3s load time)

---

**READY TO EXECUTE**: This is a comprehensive, production-grade rebuild that will transform LEADLY.AI into a professional AI services platform.
