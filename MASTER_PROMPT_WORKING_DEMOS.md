# MASTER PROMPT: Build Fully Functional AvAIL Demo Applications

## 🎯 Mission: Build Real, Working Demo Experiences

You are building **6 fully functional, interactive demo applications** that potential clients can actually use and experience. These are NOT mockups or data visualizations - they are **real working systems** that demonstrate AvAIL's capabilities.

**Repository:** `/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai`

**Current State:** You have a demo gallery UI and JSON data files, but the demos don't actually work end-to-end.

**Goal:** Build completely functional demo applications with:
- Real working websites
- Actual AI chat interactions (using Claude API)
- Live SMS simulation systems
- Functional review management interfaces
- Social media content generators
- Live ad performance dashboards

---

## 🏗️ Architecture Overview

### Demo Hosting Strategy

Each demo will be a **fully self-contained sub-application** within the Next.js app:

```
/demos/[demoId]/
  ├── live/          # The actual working demo application
  ├── preview/       # Overview/introduction page (already built)
  └── embed/         # Embeddable iframe version
```

### Technical Approach

1. **Separate Routes** - Each demo gets its own `/demos/[id]/live` route
2. **Real AI Integration** - Use Claude API for actual AI responses
3. **Real-time Simulation** - WebSocket or polling for live updates
4. **Iframe Embedding** - Demos can be embedded on external sites
5. **Full Interactivity** - Users can click, type, and interact fully

---

## 📋 DEMO 1: AvAIL CRM (Fully Functional)

### What to Build

A **fully working CRM application** that a prospect can actually use:

#### Features to Implement:
1. **Live Calendar**
   - Drag-and-drop appointment scheduling
   - Click to add new appointments
   - Real-time updates when appointments are added
   - Modal to edit appointment details

2. **Interactive Pipeline**
   - Drag leads between pipeline stages (New → Contacted → Quoted → Won)
   - Click leads to see full details
   - Add new leads via form
   - Visual animations when moving cards

3. **Automation Engine**
   - Toggle automations on/off with visual feedback
   - Simulate automation triggers (e.g., "Reminder sent to Sarah Johnson")
   - Show real-time notifications when automations fire

4. **Route Optimization Map**
   - Use Mapbox GL to show actual routes
   - Display today's appointments on a real map
   - Show optimized vs. non-optimized route comparison
   - Calculate real distances and time savings

#### Technical Implementation:

**Route:** `/demos/crm/live`

**Tech Stack:**
- React with useState/useContext for state management
- Mapbox GL for route visualization
- react-beautiful-dnd for drag-and-drop
- LocalStorage to persist demo data during session
- Modal dialogs for adding/editing items

**Files to Create:**
```
src/app/(app)/demos/crm/live/
  ├── page.tsx                    # Main CRM app
  ├── components/
  │   ├── calendar-view.tsx       # Interactive calendar
  │   ├── pipeline-board.tsx      # Drag-drop pipeline
  │   ├── automation-panel.tsx    # Automation controls
  │   ├── route-map.tsx          # Mapbox integration
  │   ├── add-appointment-modal.tsx
  │   └── add-lead-modal.tsx
  └── hooks/
      ├── use-crm-data.ts        # State management
      └── use-automations.ts     # Automation logic
```

**Key Features:**
- User can add their own test appointments
- User can drag leads through pipeline
- User sees real-time automation "triggers"
- Map shows actual routes in their city (ask for zip code)

---

## 📋 DEMO 2: AvAIL Website (Fully Functional)

### What to Build

A **complete working website for a fake plumbing company** with a real AI chat widget that actually works:

#### Company: "ProPlumb Services"
- Full landing page with hero, services, about, contact
- Real AI-powered chat widget using Claude API
- Lead capture forms that actually submit
- Service booking calendar
- Real-time chat with typing indicators

#### Features to Implement:

1. **Complete Landing Page**
   - Hero section with CTA
   - Services grid (Emergency Repair, Installation, Maintenance)
   - Testimonials carousel
   - Contact form
   - Footer with business info

2. **Live AI Chat Widget**
   - Uses actual Claude API for responses
   - Context-aware responses (knows company services, pricing, availability)
   - Can answer questions naturally
   - Collects lead information (name, phone, address, issue)
   - Creates "lead" in mini-CRM on demo dashboard

3. **Service Booking Form**
   - Select service type
   - Pick date/time from available slots
   - Enter customer information
   - Get instant confirmation

4. **Demo Dashboard**
   - Shows leads captured in real-time
   - Displays chat conversations
   - Shows conversion rate

#### Technical Implementation:

**Routes:**
- `/demos/website/live` - The actual ProPlumb website
- `/demos/website/live/dashboard` - Demo dashboard showing captured leads

**Tech Stack:**
- Claude API integration for chat responses
- React Hook Form for forms
- Framer Motion for animations
- WebSocket or polling for real-time lead updates
- LocalStorage for demo session persistence

**Files to Create:**
```
src/app/(app)/demos/website/live/
  ├── page.tsx                    # ProPlumb landing page
  ├── dashboard/page.tsx          # Demo dashboard
  ├── components/
  │   ├── hero-section.tsx
  │   ├── services-grid.tsx
  │   ├── chat-widget.tsx         # The AI chat widget
  │   ├── booking-form.tsx
  │   ├── lead-dashboard.tsx
  │   └── testimonials.tsx
  ├── api/
  │   └── chat/route.ts          # Claude API integration
  └── hooks/
      ├── use-chat.ts
      └── use-leads.ts
```

**Claude API Integration:**
```typescript
// System prompt for chat widget
const SYSTEM_PROMPT = `You are a helpful AI assistant for ProPlumb Services, a plumbing company in Denver, CO.

Services:
- Emergency Plumbing: $150 service call + parts/labor
- Water Heater Installation: $800-1500
- Drain Cleaning: $100-200
- Leak Repair: $75-300

You can:
1. Answer questions about services and pricing
2. Check availability (say we have slots today at 2pm, 4pm, 6pm)
3. Collect customer info (name, phone, address, issue description)
4. Book emergency services immediately

Be friendly, professional, and helpful. When you have all info, create a lead.`;
```

**Key Features:**
- Prospect can actually chat with AI about plumbing issues
- AI responds intelligently based on context
- Leads are captured and displayed on dashboard
- Prospect sees real-time conversion happening

---

## 📋 DEMO 3: AvAIL SMS (Fully Functional)

### What to Build

A **working SMS automation system** where prospects can text a demo number and receive automated responses:

#### Company: "Elite Auto Detailing"

#### Features to Implement:

1. **SMS Simulator Interface**
   - iPhone-style message interface
   - User can type and send messages AS the customer
   - System responds automatically based on triggers
   - Show automation rules being triggered in real-time

2. **Automation Rules Engine**
   - Booking confirmation flow
   - Reminder sending
   - Status updates
   - Review requests
   - User can customize automation rules

3. **Dashboard**
   - Shows all SMS conversations
   - Displays automation performance
   - Shows saved time metrics

#### Technical Implementation:

**Route:** `/demos/sms/live`

**Two Modes:**
1. **Simulation Mode:** User plays customer and receives auto-responses
2. **Business Dashboard Mode:** Shows all conversations and automation rules

**Tech Stack:**
- Pattern matching for SMS triggers (e.g., "YES" = confirm, "CHANGE" = reschedule)
- Rule engine for automation triggers
- Real-time message sending with delays
- Conversation threading

**Files to Create:**
```
src/app/(app)/demos/sms/live/
  ├── page.tsx                    # Main SMS demo
  ├── components/
  │   ├── sms-simulator.tsx       # Customer side (send messages)
  │   ├── conversation-list.tsx   # Business dashboard
  │   ├── automation-rules.tsx    # Configure rules
  │   └── metrics-panel.tsx       # Performance stats
  └── lib/
      ├── sms-engine.ts          # SMS automation logic
      └── pattern-matcher.ts     # Detect keywords
```

**Automation Logic Example:**
```typescript
const SMS_RULES = [
  {
    trigger: "NEW_BOOKING",
    delay: "5 minutes",
    message: "Hi {{name}}! Your {{service}} is confirmed for {{date}} at {{time}}. Reply YES to confirm or CHANGE to reschedule."
  },
  {
    trigger: "CUSTOMER_REPLY_YES",
    delay: "immediate",
    message: "Perfect! You're all set. We'll send a reminder 2 hours before."
  },
  {
    trigger: "2_HOURS_BEFORE",
    delay: "2 hours before appointment",
    message: "Hi {{name}}! Reminder: Your appointment is at {{time}} today. See you soon! 🚗✨"
  }
];
```

**Key Features:**
- User can actually send messages and get auto-responses
- See rules being triggered in real-time
- Customize automation rules and test them
- Dashboard shows time savings

---

## 📋 DEMO 4: AvAIL Reviews (Fully Functional)

### What to Build

A **working review management system** that generates AI responses to reviews in real-time:

#### Company: "Sunset Pool Service"

#### Features to Implement:

1. **Review Dashboard**
   - Shows recent Google/Yelp reviews
   - User can add new reviews manually to test
   - Filter by platform, rating, sentiment

2. **AI Response Generator**
   - Click "Generate AI Response" on any review
   - Uses Claude API to generate contextual response
   - User can edit before "sending"
   - Show response being generated with animation

3. **Sentiment Analysis**
   - Real-time sentiment detection using Claude
   - Visual sentiment breakdown
   - Common themes extraction

4. **Review Request System**
   - Simulate sending review requests
   - Show request templates
   - Track completion rates

#### Technical Implementation:

**Route:** `/demos/reviews/live`

**Tech Stack:**
- Claude API for response generation and sentiment analysis
- Editable responses before "sending"
- Real-time sentiment classification
- Review request automation

**Files to Create:**
```
src/app/(app)/demos/reviews/live/
  ├── page.tsx
  ├── components/
  │   ├── reviews-dashboard.tsx
  │   ├── review-card.tsx
  │   ├── ai-response-generator.tsx
  │   ├── sentiment-analyzer.tsx
  │   ├── add-review-modal.tsx
  │   └── metrics-panel.tsx
  ├── api/
  │   ├── generate-response/route.ts  # Claude API
  │   └── analyze-sentiment/route.ts  # Claude API
  └── lib/
      └── review-templates.ts
```

**Claude API Integration:**
```typescript
const REVIEW_RESPONSE_PROMPT = `Generate a professional, empathetic response to this review for Sunset Pool Service:

Review: {{review_text}}
Rating: {{rating}} stars
Platform: {{platform}}

Guidelines:
- If 5 stars: Thank them warmly, be enthusiastic
- If 4 stars: Thank them, acknowledge any minor issues
- If 1-3 stars: Apologize sincerely, offer to make it right, provide manager contact

Keep response under 150 words, authentic and professional.`;
```

**Key Features:**
- User can paste their own review and get AI response
- See response generated in real-time
- Edit and customize responses
- Track response rate and sentiment improvement

---

## 📋 DEMO 5: AvAIL Social Media (Fully Functional)

### What to Build

An **AI-powered social media content generator** that creates real posts, captions, and images:

#### Company: "Prestige Auto Detailing"

#### Features to Implement:

1. **Content Calendar**
   - 30-day calendar view
   - Click any day to see/generate posts
   - Drag to reschedule posts
   - Visual preview of each post

2. **AI Content Generator**
   - User clicks "Generate Post"
   - Select post type (Before/After, Educational, Promotion, etc.)
   - Claude generates caption with hashtags
   - Option to regenerate if not satisfied

3. **Image Generator Integration**
   - Integrate with image generation API (or use placeholders)
   - Generate "Sora-style" video thumbnails
   - Before/After image templates

4. **Performance Dashboard**
   - Simulated performance metrics
   - Show engagement rates
   - Lead tracking from social

5. **Post Previews**
   - Instagram-style preview
   - Facebook-style preview
   - TikTok-style preview

#### Technical Implementation:

**Route:** `/demos/social/live`

**Tech Stack:**
- Claude API for caption generation
- Image placeholders or Unsplash API for images
- Calendar library (FullCalendar or custom)
- Post preview components

**Files to Create:**
```
src/app/(app)/demos/social/live/
  ├── page.tsx
  ├── components/
  │   ├── content-calendar.tsx
  │   ├── post-generator.tsx
  │   ├── post-preview.tsx
  │   ├── instagram-preview.tsx
  │   ├── facebook-preview.tsx
  │   ├── platform-selector.tsx
  │   └── performance-metrics.tsx
  ├── api/
  │   └── generate-caption/route.ts  # Claude API
  └── lib/
      ├── post-templates.ts
      └── hashtag-generator.ts
```

**Claude API Integration:**
```typescript
const SOCIAL_POST_PROMPT = `Generate an engaging social media post for Prestige Auto Detailing:

Post Type: {{post_type}}
Platform: {{platform}}
Topic: {{topic}}

Guidelines:
- Write in a friendly, professional tone
- Include relevant emojis (but don't overdo it)
- Add 5-10 relevant hashtags
- Include a clear call-to-action
- Keep it under 150 characters for Instagram, 280 for others

Generate caption now:`;
```

**Key Features:**
- User can generate posts on demand
- See posts generated in real-time with AI
- Customize and regenerate captions
- Visual preview of how posts will look
- Performance metrics simulation

---

## 📋 DEMO 6: AvAIL Ads & SEO (Fully Functional)

### What to Build

A **live advertising and SEO performance dashboard** with real data visualization:

#### Company: "Elite HVAC Solutions"

#### Features to Implement:

1. **Live Dashboard**
   - Real-time charts and graphs (animated)
   - Google Ads performance
   - Facebook Ads metrics
   - SEO keyword rankings

2. **Campaign Builder**
   - User can create test ad campaign
   - AI suggests keywords using Claude
   - Get estimated performance

3. **Keyword Research Tool**
   - User enters their business type
   - Claude suggests top keywords
   - Show search volume and competition

4. **ROI Calculator**
   - Input budget
   - Select services
   - Get projected ROI

5. **Animated Charts**
   - Use Chart.js or Recharts
   - Animate data loading
   - Interactive tooltips

#### Technical Implementation:

**Route:** `/demos/ads/live`

**Tech Stack:**
- Claude API for keyword suggestions
- Chart.js or Recharts for visualizations
- Real-time data updates
- Interactive calculators

**Files to Create:**
```
src/app/(app)/demos/ads/live/
  ├── page.tsx
  ├── components/
  │   ├── performance-dashboard.tsx
  │   ├── google-ads-panel.tsx
  │   ├── facebook-ads-panel.tsx
  │   ├── seo-panel.tsx
  │   ├── keyword-research.tsx
  │   ├── campaign-builder.tsx
  │   ├── roi-calculator.tsx
  │   └── charts/
  │       ├── line-chart.tsx
  │       ├── bar-chart.tsx
  │       └── pie-chart.tsx
  ├── api/
  │   └── suggest-keywords/route.ts  # Claude API
  └── lib/
      ├── calculate-roi.ts
      └── keyword-data.ts
```

**Claude API Integration:**
```typescript
const KEYWORD_SUGGESTION_PROMPT = `Suggest the top 10 keywords for a {{business_type}} business in {{location}}.

For each keyword provide:
- Keyword phrase
- Estimated monthly searches
- Competition level (Low/Medium/High)
- Estimated CPC
- Recommendation (why this keyword is valuable)

Format as JSON array.`;
```

**Key Features:**
- User can input their business and get keyword suggestions
- Interactive ROI calculator
- Build and visualize ad campaigns
- Animated performance charts
- Export reports

---

## 🚀 Implementation Plan

### Phase 1: Infrastructure (2 hours)

1. **Set up API routes for Claude integration**
   - Create `/api/ai/chat` for chat responses
   - Create `/api/ai/generate-content` for content generation
   - Create `/api/ai/analyze-sentiment` for sentiment analysis
   - Create `/api/ai/suggest-keywords` for keyword research

2. **Create shared demo components**
   - DemoLayout (wrapper for all demos)
   - DemoNavigation (switch between modes)
   - DemoControls (reset, settings)
   - LoadingStates (for AI generation)

3. **Set up state management**
   - Use Context API or Zustand
   - Persist demo state in LocalStorage
   - Real-time updates across components

### Phase 2: Build Demos (8-10 hours)

**Priority Order:**
1. **Website Demo** (most impressive, uses AI) - 2 hours
2. **CRM Demo** (most complex, interactive) - 2 hours
3. **Reviews Demo** (AI-powered, quick wins) - 1.5 hours
4. **Social Demo** (content generation) - 1.5 hours
5. **SMS Demo** (automation simulation) - 1.5 hours
6. **Ads Demo** (data visualization) - 1.5 hours

### Phase 3: Integration & Polish (2 hours)

1. **Update demo preview pages**
   - Add "Try Live Demo" button
   - Link to `/demos/[id]/live` routes
   - Add demo navigation

2. **Create demo switcher**
   - Easy navigation between demos
   - "Back to Gallery" button
   - Demo progress indicator

3. **Add demo instructions**
   - Onboarding tooltips
   - "Try this" suggestions
   - Reset demo button

4. **Mobile optimization**
   - Ensure all demos work on mobile
   - Adjust layouts for small screens
   - Touch-friendly controls

### Phase 4: Testing & Refinement (1 hour)

1. **Test each demo end-to-end**
2. **Check AI response quality**
3. **Verify mobile responsiveness**
4. **Add error handling**
5. **Performance optimization**

---

## 🎨 Design Principles

### User Experience
1. **Instant Gratification** - Demos load fast, AI responds quickly
2. **Clear Instructions** - Tell users what to do next
3. **Visual Feedback** - Show loading states, success messages
4. **Forgiving** - Easy to reset and try again
5. **Impressive** - Make AI feel magical

### Visual Design
1. **Branded** - Each demo has a fake company brand
2. **Professional** - Production-quality interfaces
3. **Animated** - Smooth transitions and micro-interactions
4. **Realistic** - Looks like real software
5. **Polished** - No rough edges or placeholder text

---

## 🔑 Critical Features for Each Demo

### Website Demo
✅ **MUST HAVE:**
- Real AI chat that responds intelligently
- Lead capture that shows on dashboard
- Actual form submissions
- Real-time updates

### CRM Demo
✅ **MUST HAVE:**
- Drag-and-drop that actually works
- Add appointments/leads functionality
- Real map with routes
- Automation triggers that fire

### SMS Demo
✅ **MUST HAVE:**
- Type messages and get auto-responses
- Pattern matching for keywords
- Conversation threading
- Automation rules visualization

### Reviews Demo
✅ **MUST HAVE:**
- AI-generated responses
- Paste your own review to test
- Sentiment analysis
- Editable responses

### Social Demo
✅ **MUST HAVE:**
- AI-generated captions
- Regenerate if not satisfied
- Visual post previews
- Multiple platform styles

### Ads Demo
✅ **MUST HAVE:**
- AI keyword suggestions
- Interactive ROI calculator
- Animated charts
- Campaign builder

---

## 📊 Success Metrics

Each demo should achieve:
- ✅ **< 2 second load time**
- ✅ **< 3 seconds AI response time**
- ✅ **100% functional on mobile**
- ✅ **Zero placeholder text in final version**
- ✅ **Smooth animations (60fps)**
- ✅ **Clear CTAs for booking real demo**

---

## 🛠️ Technical Requirements

### API Integration

**Environment Variables Needed:**
```env
ANTHROPIC_API_KEY=sk-ant-...
MAPBOX_API_KEY=pk.eyJ1...
```

**Claude API Usage:**
- Use `claude-3-5-sonnet-20241022` for best quality
- Set max_tokens: 1024 for most responses
- Temperature: 0.7 for creative content, 0.3 for factual
- Stream responses for real-time feel

### State Management

**Use Context API for each demo:**
```typescript
// Example: CRMContext
const CRMContext = createContext({
  appointments: [],
  leads: [],
  automations: [],
  addAppointment: (apt) => {},
  moveLead: (leadId, stage) => {},
  triggerAutomation: (id) => {}
});
```

### Data Persistence

Use LocalStorage to persist demo state:
```typescript
// Save demo state
localStorage.setItem('demo-crm-state', JSON.stringify(state));

// Load on mount
const savedState = JSON.parse(localStorage.getItem('demo-crm-state') || '{}');
```

---

## 🎯 Deliverables

When complete, prospects should be able to:

1. **Navigate to any demo from the gallery**
2. **Click "Try Live Demo" button**
3. **Interact with a fully functional application**
4. **See AI generate responses in real-time**
5. **Capture their own test data**
6. **Reset and try again**
7. **Book a real demo after seeing the value**

---

## 🚨 Critical Implementation Notes

### DO:
✅ Use actual Claude API for all AI features
✅ Make demos fully interactive (click, type, drag)
✅ Show real-time feedback and loading states
✅ Let users input their own test data
✅ Create realistic fake company brands
✅ Make it impressive and memorable

### DON'T:
❌ Use static mockups or screenshots
❌ Have non-functional buttons
❌ Show placeholder text in final version
❌ Make users wait more than 3 seconds
❌ Skip mobile responsiveness
❌ Leave out error handling

---

## 📱 Mobile-First Checklist

For each demo, verify:
- [ ] Works on iPhone (375px width)
- [ ] Works on Android (360px width)
- [ ] Touch targets are 44px minimum
- [ ] No horizontal scrolling
- [ ] Forms are easy to fill on mobile
- [ ] Modals work on small screens
- [ ] Navigation is thumb-friendly

---

## 🎓 Example: Website Demo Implementation

Here's a detailed example of how to build the Website demo:

### Step 1: Create the Landing Page
```typescript
// src/app/(app)/demos/website/live/page.tsx
export default function ProPlumbLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Services />
      <Testimonials />
      <Contact />
      <ChatWidget /> {/* This is the key interactive element */}
    </div>
  );
}
```

### Step 2: Build the AI Chat Widget
```typescript
// src/components/demos/website/chat-widget.tsx
export function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    // Call Claude API
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: text }],
        systemPrompt: PROPLUMB_SYSTEM_PROMPT
      })
    });

    const data = await response.json();
    setIsTyping(false);

    // Add AI response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.message
    }]);

    // Check if lead info was collected
    if (data.leadCaptured) {
      // Show success notification
      // Update dashboard
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <ChatWindow
          messages={messages}
          onSend={sendMessage}
          isTyping={isTyping}
        />
      ) : (
        <ChatButton onClick={() => setIsOpen(true)} />
      )}
    </div>
  );
}
```

### Step 3: Create Claude API Route
```typescript
// src/app/api/ai/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  const { messages, systemPrompt } = await request.json();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  });

  const response = message.content[0].text;

  // Check if lead info was collected
  const leadCaptured = detectLeadInfo(response);

  return Response.json({
    message: response,
    leadCaptured
  });
}
```

---

## 🚀 Ready to Build?

This prompt provides everything needed to create **production-quality, fully functional demo applications** that will impress prospects and close deals.

**Next Steps:**
1. Read through this entire document
2. Set up Claude API keys
3. Start with Website Demo (highest impact)
4. Build demos in priority order
5. Test thoroughly on mobile
6. Deploy and show clients!

**When complete, prospects will say:**
> "Wow, this actually works! I can see exactly how this would help my business. Let's sign up!"

**Let's build something amazing! 🚀**
