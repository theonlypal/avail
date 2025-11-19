# AVAIL CO-PILOT AUTO-DIALER: Complete Implementation Plan

## Overview
Build an undetectable, intelligent auto-dialer system integrated into Leadly.AI that:
- Auto-dials selected leads from the dashboard
- Opens AVAIL Co-Pilot interface during live calls
- Provides real-time transcription and AI coaching
- Detects objections, opportunities, and gives talking points
- Records calls and analyzes performance post-call

Think: **Cluely for Sales** - but better, integrated, and tailored to our architecture.

---

## Core Features

### 1. Lead Selection & Dialing
- **Multi-select leads** from dashboard table
- **Bulk dial queue** - dial 10, 20, 50+ leads sequentially
- **Smart dialing** - skip voicemail, detect answering machines
- **Local presence** - display local area code to recipient
- **Call scheduling** - queue calls for specific times
- **Priority routing** - dial high-score leads first

### 2. AVAIL Co-Pilot Interface (Live Call Assistant)
**Real-Time Panels:**
- **Lead Card** - Name, business, score, pain points visible at glance
- **Live Transcription** - See what's being said in real-time (both sides)
- **AI Coaching** - Proactive talking points and suggestions
- **Objection Detection** - AI flags when prospect raises objections
- **Script Guidance** - Dynamic script that adapts to conversation flow
- **Sentiment Meter** - Real-time gauge of prospect interest/frustration

### 3. Real-Time Transcription
- **Both sides transcribed** - Your voice + prospect voice
- **Streaming display** - Words appear as spoken (< 500ms latency)
- **Speaker labels** - Clear visual distinction (You: / Prospect:)
- **Keyword highlighting** - "budget", "not interested", "tell me more" highlighted
- **Auto-save** - Transcript saved to lead record post-call

### 4. AI Coaching & Talking Points
**Proactive AI Suggestions:**
- "Prospect mentioned budget concerns - suggest payment plans"
- "They asked about timeline - emphasize quick ROI"
- "Great opening! Now ask discovery question about their pain points"
- "They sound interested - move to close"

**Context-Aware:**
- AI references lead's opportunity score, industry, pain points
- Suggests services from AVAIL that match their needs
- Warns about common objections for this industry
- Celebrates wins ("Great response! They're engaged")

**Live Objection Handling:**
- Detects: "That's too expensive", "I need to think about it", etc.
- Instantly shows: Pre-written objection responses
- Adapts script to address concern
- Tracks which objections came up for post-call analysis

### 5. Post-Call Actions
- **Auto-log call** - Duration, outcome, notes saved to CRM
- **AI call summary** - 3-sentence summary of what happened
- **Next steps** - AI suggests follow-up actions
- **Call recording** - Downloadable audio file
- **Full transcript** - Searchable, shareable
- **Performance score** - AI grades your call quality
- **Coaching tips** - Specific areas to improve

---

## Technical Architecture

### Tech Stack

**Frontend (Co-Pilot Interface):**
- Next.js + React for UI
- Tailwind CSS for styling  
- Server-Sent Events (SSE) for real-time updates
- Web Audio API for call audio handling

**Backend (Calling Infrastructure):**
- **Twilio Voice API** - Place outbound calls
- **Twilio Streams** - Real-time audio streaming
- **OpenAI Whisper API** - Speech-to-text transcription
- **Anthropic Claude 3.5 Sonnet** - AI coaching and analysis
- **SQLite** - Store call logs, transcripts, analytics

**Real-Time Processing:**
- Server-sent events for live updates
- WebSocket for audio streaming (optional)
- Streaming AI responses for instant coaching

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic calling infrastructure

1. **Twilio Integration**
   - Set up Twilio account and phone numbers
   - Create API wrapper for placing calls
   - Test outbound calling to single number

2. **Call UI Shell**
   - Build Co-Pilot modal/page
   - Lead card display
   - Call controls (hang up, mute, etc.)
   - Basic timer and status

3. **Database Schema**
   - calls table (id, lead_id, started_at, ended_at, duration, status, outcome)
   - call_transcripts table (id, call_id, timestamp, speaker, text)
   - call_notes table (id, call_id, notes, ai_summary, performance_score)

**Deliverable:** Can click "Call" button on lead → Twilio places call → UI shows active call

---

### Phase 2: Transcription (Week 2)
**Goal:** Real-time transcription during calls

1. **Twilio Streams Setup**
   - Configure WebSocket endpoint for audio stream
   - Receive real-time audio chunks from Twilio

2. **Whisper Integration**
   - Send audio chunks to OpenAI Whisper API
   - Process transcription responses
   - Store transcripts in database

3. **Live Transcription UI**
   - Display transcription feed in Co-Pilot
   - Auto-scroll as new words appear
   - Speaker identification (You vs Prospect)
   - Keyword highlighting

**Deliverable:** During call, see live transcription of conversation in UI

---

### Phase 3: AI Coaching (Week 3)
**Goal:** Intelligent coaching during calls

1. **Claude AI Integration**
   - Stream transcription to Claude in real-time
   - Prompt Claude to act as sales coach
   - Parse Claude's coaching suggestions

2. **Coaching UI Panel**
   - Dedicated panel for AI suggestions
   - Color-coded urgency (green tip, yellow warning, red objection)
   - Quick-copy talking points
   - Objection detector with pre-written responses

3. **Context Awareness**
   - Pass lead data to AI (name, business, score, pain points)
   - Reference AVAIL services in suggestions
   - Industry-specific coaching

**Deliverable:** AI provides live coaching suggestions based on conversation flow

---

### Phase 4: Auto-Dialer Queue (Week 4)
**Goal:** Bulk dialing multiple leads

1. **Queue Management**
   - Select multiple leads from dashboard
   - Build dial queue with status (pending, calling, completed, failed)
   - Sequential dialing (finish one, start next)

2. **Smart Dialing**
   - Answering machine detection (skip or leave voicemail)
   - Busy signal handling (retry later)
   - No-answer handling (mark and move on)

3. **Queue UI**
   - Visual queue with progress bar
   - Skip to next lead manually
   - Pause/resume queue
   - Queue statistics (calls completed, conversion rate)

**Deliverable:** Select 20 leads → auto-dial them one by one with Co-Pilot active for each

---

### Phase 5: Polish & Analytics (Week 5)
**Goal:** Production-ready with insights

1. **Post-Call Features**
   - Auto-save transcript and recording
   - AI-generated call summary
   - Performance scoring
   - Suggest next steps (schedule follow-up, send email, etc.)

2. **Analytics Dashboard**
   - Total calls made
   - Average call duration
   - Conversion rate by caller
   - Common objections
   - Best-performing scripts

3. **Optimizations**
   - Reduce transcription latency
   - Improve AI response time
   - Call quality monitoring
   - Error handling and retries

**Deliverable:** Fully functional auto-dialer with analytics and insights

---

## Detailed Component Specifications

### Component 1: Call Button & Initiation

**Location:** Lead table row, lead detail page

**UI:**
```jsx
<Button onClick={() => initiateCall(lead)}>
  <Phone className="h-4 w-4" />
  Call {lead.business_name}
</Button>
```

**Flow:**
1. User clicks "Call" button
2. Frontend sends POST request to `/api/calls/initiate`
3. Backend:
   - Creates call record in database
   - Calls Twilio API to place call
   - Returns call SID and status
4. Frontend opens Co-Pilot interface with call ID
5. Poll `/api/calls/{callId}/status` every second for updates

---

### Component 2: AVAIL Co-Pilot Interface

**Layout:** Full-screen modal or dedicated `/calls/[callId]` page

**Sections:**
```
┌─────────────────────────────────────────────────────────┐
│ AVAIL Co-Pilot - Calling John's HVAC (Score: 87)       │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┬──────────────┬──────────────────────┐  │
│ │  Lead Card  │ Call Status  │   AI Coaching        │  │
│ │             │              │                      │  │
│ │ John's HVAC │ Connected    │ → Ask about their    │  │
│ │ 4.1 ★       │ 1:23 elapsed │   biggest challenge  │  │
│ │ Austin, TX  │              │                      │  │
│ │             │ [Mute] [End] │ ⚠ Prospect mentioned │  │
│ │ Pain Points:│              │   price - address    │  │
│ │ - No website│              │   ROI                │  │
│ │ - Low rating│              │                      │  │
│ └─────────────┴──────────────┴──────────────────────┘  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📞 Live Transcription                            │    │
│ │─────────────────────────────────────────────────│    │
│ │ You: Hi, is this John from John's HVAC?         │    │
│ │ Prospect: Yes, speaking.                        │    │
│ │ You: Great! I'm calling about helping you...    │    │
│ │ Prospect: How did you get my number?            │    │
│ │ You: I found your business on Google Maps...    │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 💡 Suggested Talking Points                      │    │
│ │─────────────────────────────────────────────────│    │
│ │ • Mention your 4.1 rating could improve          │    │
│ │ • Your competitors have websites - you don't     │    │
│ │ • AVAIL can build you a website with AI chat    │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

### Component 3: Transcription Engine

**Flow:**
1. Twilio sends audio stream via WebSocket to `/api/calls/stream`
2. Backend buffers audio chunks (250ms segments)
3. Send audio to Whisper API for transcription
4. Receive transcription text with speaker label
5. Save to database: `call_transcripts` table
6. Broadcast via SSE to connected Co-Pilot clients
7. Frontend receives SSE and appends to transcript UI

**Optimization:**
- Use Whisper's streaming mode for lower latency
- Buffer intelligently (wait for natural pauses)
- Cache speaker identification to reduce API calls

---

### Component 4: AI Coaching Engine

**Prompt to Claude:**
```
You are an expert sales coach helping a sales rep sell AVAIL AI services to local service businesses.

Lead Information:
- Business: John's HVAC
- Industry: HVAC
- Location: Austin, TX
- Opportunity Score: 87/100
- Pain Points: No website, 4.1 star rating, missing calls after hours
- Recommended Services: AVAIL Website, Call & Text Support, CRM

Your job: Analyze the live call transcription and provide real-time coaching.

Give:
- Talking points (what to say next)
- Objection handling (when they resist)
- Closing signals (when to ask for sale)
- Encouragement (when doing well)

Be concise - 1-2 sentences per suggestion.

Transcript so far:
[streaming transcript here...]

Provide your next coaching suggestion:
```

**AI Response Examples:**
- ✅ "Great opening! Now ask: 'What's your biggest challenge with getting new customers?'"
- ⚠️ "Prospect sounds hesitant - mention the 90-day money-back guarantee"
- 🚨 "OBJECTION: Price concern. Response: 'It costs less than 1 job. If we get you 3 extra jobs per month, you're up $21K net.'"
- 🎯 "Buying signal detected! Ask: 'Would you like to start with the Pro tier or go straight to Premium?'"

**Update Frequency:**
- Send transcript to Claude every 10-15 seconds
- Or trigger on keywords: "expensive", "not sure", "maybe", "interested"
- Stream AI response back to frontend via SSE

---

### Component 5: Bulk Dialer Queue

**UI: Queue Panel**
```
┌──────────────────────────────────────────────┐
│ Auto-Dialer Queue (15 leads selected)        │
├──────────────────────────────────────────────┤
│ ⏸ Pause Queue   ⏭ Skip Lead   📊 View Stats  │
├──────────────────────────────────────────────┤
│ ✓ Cool Breeze HVAC     - Connected (3:45)   │
│ ⏳ Pacific Coast HVAC   - Dialing...          │
│ 📋 Elite Plumbing       - Pending            │
│ 📋 Pro Dental           - Pending            │
│ 📋 Quality Auto Repair  - Pending            │
│                                              │
│ Progress: 2/15 completed | 1 converted       │
└──────────────────────────────────────────────┘
```

**Flow:**
1. User selects leads from table (checkboxes)
2. Clicks "Start Auto-Dialer"
3. Backend creates dial queue in database
4. Sequentially dial each lead:
   - Place call
   - Open Co-Pilot
   - Wait for call to end
   - Log outcome
   - Move to next lead
5. Continue until queue empty or user pauses

**Smart Features:**
- Detect voicemail → skip or leave pre-recorded message
- Detect no-answer after 30 seconds → mark and skip
- Detect busy signal → retry later
- Manual override → skip to next lead anytime

---

##API Endpoints

### POST /api/calls/initiate
**Purpose:** Place a call to a lead

**Request:**
```json
{
  "leadId": "lead-123",
  "callerPhone": "+15551234567"
}
```

**Response:**
```json
{
  "callId": "call-456",
  "callSid": "CA123...",
  "status": "initiated",
  "leadName": "John's HVAC",
  "leadPhone": "+15125551234"
}
```

---

### GET /api/calls/{callId}/status
**Purpose:** Get current call status

**Response:**
```json
{
  "callId": "call-456",
  "status": "in-progress",
  "duration": 87,
  "connected": true
}
```

---

### GET /api/calls/{callId}/transcript (SSE)
**Purpose:** Stream live transcription

**Response:** Server-sent events
```
data: {"speaker": "user", "text": "Hi, is this John?", "timestamp": 1234567890}

data: {"speaker": "prospect", "text": "Yes, speaking.", "timestamp": 1234567895}
```

---

### GET /api/calls/{callId}/coaching (SSE)
**Purpose:** Stream AI coaching suggestions

**Response:** Server-sent events
```
data: {"type": "tip", "message": "Ask about their biggest challenge", "urgency": "normal"}

data: {"type": "objection", "message": "Price concern - mention ROI", "urgency": "high"}
```

---

### POST /api/calls/{callId}/end
**Purpose:** End the call

**Request:**
```json
{
  "outcome": "interested",
  "notes": "Wants to schedule follow-up"
}
```

**Response:**
```json
{
  "success": true,
  "duration": 245,
  "transcript": "...",
  "summary": "Prospect expressed interest in AVAIL Website..."
}
```

---

### POST /api/calls/queue/create
**Purpose:** Create bulk dial queue

**Request:**
```json
{
  "leadIds": ["lead-1", "lead-2", "lead-3"],
  "callerPhone": "+15551234567"
}
```

**Response:**
```json
{
  "queueId": "queue-789",
  "totalLeads": 3,
  "status": "pending"
}
```

---

### POST /api/calls/queue/{queueId}/start
**Purpose:** Start dialing queue

---

### POST /api/calls/queue/{queueId}/pause
**Purpose:** Pause queue

---

### POST /api/calls/queue/{queueId}/skip
**Purpose:** Skip current lead, dial next

---

## Database Schema

### `calls` table
```sql
CREATE TABLE calls (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  prospect_phone TEXT NOT NULL,
  twilio_call_sid TEXT,
  status TEXT NOT NULL, -- initiated, ringing, in-progress, completed, failed, no-answer
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration INTEGER, -- seconds
  outcome TEXT, -- interested, not-interested, callback, voicemail, no-answer
  notes TEXT,
  recording_url TEXT,
  ai_summary TEXT,
  performance_score INTEGER, -- 0-100
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### `call_transcripts` table
```sql
CREATE TABLE call_transcripts (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL,
  speaker TEXT NOT NULL, -- 'user' or 'prospect'
  text TEXT NOT NULL,
  timestamp INTEGER NOT NULL, -- milliseconds into call
  created_at TEXT NOT NULL,
  FOREIGN KEY (call_id) REFERENCES calls(id)
);
```

### `call_coaching_log` table
```sql
CREATE TABLE call_coaching_log (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL,
  type TEXT NOT NULL, -- tip, warning, objection, closing-signal
  message TEXT NOT NULL,
  urgency TEXT NOT NULL, -- low, normal, high
  timestamp INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (call_id) REFERENCES calls(id)
);
```

### `dial_queues` table
```sql
CREATE TABLE dial_queues (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  status TEXT NOT NULL, -- pending, active, paused, completed
  total_leads INTEGER NOT NULL,
  completed_leads INTEGER DEFAULT 0,
  current_lead_id TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### `dial_queue_items` table
```sql
CREATE TABLE dial_queue_items (
  id TEXT PRIMARY KEY,
  queue_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  status TEXT NOT NULL, -- pending, dialing, completed, skipped, failed
  call_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (queue_id) REFERENCES dial_queues(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (call_id) REFERENCES calls(id)
);
```

---

## Key Differentiators from Cluely

**What Cluely Does:**
- AI-powered calling for sales teams
- Real-time objection handling
- Call analytics

**What AVAIL Co-Pilot Does BETTER:**
1. **Fully Integrated** - Lives inside Leadly.AI, not separate tool
2. **Context-Aware** - Knows lead score, pain points, recommended services before call
3. **AVAIL-Specific** - Coaching tailored to selling AVAIL services, not generic
4. **SQLite-Powered** - No external database dependencies, everything local
5. **Cheaper** - Cluely costs $500-2000/month, ours is built-in
6. **Customizable** - We control the AI prompts, coaching style, and features

---

## Success Metrics

**Phase 1 Success:**
- Can place outbound call from Leadly.AI dashboard
- Co-Pilot UI loads with lead information
- Call connects and can be ended manually

**Phase 2 Success:**
- Live transcription appears in UI during call
- <1 second latency between speech and text
- Speaker identification works 95%+ accuracy

**Phase 3 Success:**
- AI provides 3-5 coaching suggestions per call
- Detects objections within 2 seconds
- Suggestions are contextually relevant

**Phase 4 Success:**
- Can queue 10+ leads for auto-dialing
- Sequential dialing works without manual intervention
- Answering machine detection skips voicemail

**Phase 5 Success:**
- Full call history and transcripts stored
- AI summary generated post-call
- Analytics show conversion rate improvement

---

## MVP Scope (Launch in 2 Weeks)

**Must-Have:**
- Single-lead calling (not bulk queue)
- Basic Co-Pilot UI with lead card
- Live transcription
- Simple AI coaching (3-4 suggestions per call)
- Call logging and transcript storage

**Nice-to-Have (Post-Launch):**
- Bulk auto-dialer queue
- Advanced coaching (objection library, script builder)
- Analytics dashboard
- Call recording playback with highlights

---

## Technical Challenges & Solutions

**Challenge 1: Transcription Latency**
- Problem: Whisper API can take 1-2 seconds
- Solution: Use Deepgram or AssemblyAI (faster streaming options)

**Challenge 2: AI Coaching Relevance**
- Problem: Claude might give generic advice
- Solution: Detailed prompt with lead context, test and iterate

**Challenge 3: Call Audio Quality**
- Problem: Poor connections lead to bad transcriptions
- Solution: Twilio's HD Voice, fallback to manual notes

**Challenge 4: Cost Management**
- Problem: Whisper + Claude + Twilio = expensive at scale
- Solution: Cache transcriptions, optimize AI calls, volume discounts

**Challenge 5: User Experience During Lag**
- Problem: Transcription delay feels awkward
- Solution: Loading indicators, buffer transcripts, show "processing..."

---

## Cost Estimate (Per Call)

- **Twilio Voice:** $0.0140/minute (avg 3 min call = $0.042)
- **Whisper API:** ~$0.006/minute (3 min = $0.018)
- **Claude API:** ~$0.003/1K tokens (avg call = 2K tokens = $0.006)
- **Total per call:** ~$0.066 (6.6 cents)

**At scale:**
- 100 calls/day = $6.60/day = $198/month
- 500 calls/day = $33/day = $990/month
- 1000 calls/day = $66/day = $1,980/month

**Revenue Potential:**
- If 10% of calls convert = 100 customers/day
- At $2,500/month AVAIL pricing = $250K MRR from calls
- Calling cost: $1,980/month (<1% of revenue)

**ROI: Insanely positive**

---

## Next Steps

1. **Get Approval** - Confirm this is the direction we want
2. **Provision Twilio** - Set up account, get phone numbers
3. **Set Up Development Environment** - Test Twilio locally
4. **Build Phase 1 (Foundation)** - Calling infrastructure + basic UI
5. **Test with Real Calls** - Internal team calling real leads
6. **Iterate Based on Feedback** - Refine coaching, UI, flow
7. **Launch Beta** - Select users test auto-dialer
8. **Full Rollout** - AVAIL Co-Pilot available to all Leadly.AI users

---

## Conclusion

AVAIL Co-Pilot Auto-Dialer will be a **game-changing feature** that:
- Makes calling leads effortless (no manual dialing)
- Ensures every call is coached and optimized
- Captures every conversation for analysis
- Increases conversion rates dramatically
- Differentiates Leadly.AI from competitors

This is the future of sales calling - AI-assisted, intelligent, integrated.

Let's build it.
