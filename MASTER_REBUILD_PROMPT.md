# LEADLY.AI COMPLETE SYSTEM REBUILD - MASTER PROMPT

## MISSION: Build a Production-Ready AI-Powered Lead Discovery & Management Platform

---

## 🎯 PROJECT OVERVIEW

**Leadly.AI** is an AI-powered lead generation and management platform that:
1. **Discovers** high-quality local business leads using AI
2. **Enriches** leads with business data and intelligence
3. **Scores** leads based on opportunity analysis
4. **Manages** leads through a beautiful dashboard
5. **Enables** automated outreach via calls, SMS, and email

**Current Status:** Database architecture fixed, but needs complete rebuild for production readiness.

**Target:** Fully functional production system with real lead discovery capabilities.

---

## 📋 COMPLETE ARCHITECTURE PLAN

### Phase 1: Core Database & API Layer (Priority: CRITICAL)

#### 1.1 Database Architecture
**Status:** ✅ Partially Complete
**Issues to Fix:**
- Production Neon database is empty (no leads)
- Need migration script for Neon schema
- Missing indexes for performance

**Action Items:**
```typescript
// 1. Create comprehensive migration script
// File: scripts/migrate-neon-schema.ts

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

async function migrateSchema() {
  // Drop existing tables if needed (CAREFUL!)
  // await sql`DROP TABLE IF EXISTS call_logs CASCADE`;
  // await sql`DROP TABLE IF EXISTS leads CASCADE`;
  // await sql`DROP TABLE IF EXISTS team_members CASCADE`;
  // await sql`DROP TABLE IF EXISTS teams CASCADE`;

  // Create tables with proper constraints
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      subscription_tier TEXT DEFAULT 'starter',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'rep',
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      location TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      website_score INTEGER DEFAULT 0,
      social_presence TEXT,
      ad_presence BOOLEAN DEFAULT false,
      opportunity_score INTEGER DEFAULT 0,
      pain_points JSONB,
      recommended_services JSONB,
      ai_summary TEXT,
      lat REAL,
      lng REAL,
      added_by TEXT,
      source TEXT DEFAULT 'manual',
      enriched_at TIMESTAMP,
      scored_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(opportunity_score DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_location ON leads(location)`;

  await sql`
    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      member_id TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      call_sid TEXT,
      status TEXT DEFAULT 'initiated',
      direction TEXT DEFAULT 'outbound',
      duration INTEGER DEFAULT 0,
      recording_url TEXT,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create default team if doesn't exist
  const teams = await sql`SELECT id FROM teams LIMIT 1`;
  if (teams.length === 0) {
    const teamId = 'team-' + Date.now();
    await sql`INSERT INTO teams (id, team_name, subscription_tier) VALUES (${teamId}, 'Sales Team', 'starter')`;

    const memberId = 'member-' + Date.now();
    await sql`INSERT INTO team_members (id, team_id, name, email, role) VALUES (${memberId}, ${teamId}, 'Admin User', 'admin@leadly.ai', 'owner')`;
  }

  console.log('✅ Neon database schema migrated successfully');
}

migrateSchema().catch(console.error);
```

#### 1.2 Unified Database Interface
**Status:** ✅ Complete
**Files:**
- `src/lib/db.ts` - Dual-mode database (SQLite dev, Neon prod)
- `src/lib/team.ts` - Team operations
- `src/lib/leads-sqlite.ts` - Lead operations

**Validation:** All functions use `db.query()`, `db.run()`, `db.get()`

---

### Phase 2: AI Lead Discovery System (Priority: HIGH)

#### 2.1 Lead Discovery Architecture
**Current Issues:**
- AI discovery exists but not integrated
- No production lead data
- Missing enrichment pipeline

**Required Components:**

```typescript
// File: src/lib/ai-lead-discovery-v2.ts

import Anthropic from '@anthropic-ai/sdk';

interface DiscoveryQuery {
  industry: string;
  location: string;
  targetCount: number;
  filters?: {
    minRating?: number;
    hasWebsite?: boolean;
    minReviews?: number;
  };
}

interface DiscoveredLead {
  business_name: string;
  industry: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  review_count: number;
  source: 'google_maps' | 'yelp' | 'web_search';
}

export class AILeadDiscovery {
  private anthropic: Anthropic;
  private serperApiKey: string;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.serperApiKey = process.env.SERPER_API_KEY!;
  }

  /**
   * Discover leads using AI-powered search
   */
  async discoverLeads(query: DiscoveryQuery): Promise<DiscoveredLead[]> {
    // 1. Use Serper API to search for businesses
    const searchResults = await this.searchBusinesses(query);

    // 2. Use Claude to analyze and filter results
    const qualifiedLeads = await this.qualifyLeads(searchResults, query);

    // 3. Enrich leads with additional data
    const enrichedLeads = await this.enrichLeads(qualifiedLeads);

    return enrichedLeads;
  }

  private async searchBusinesses(query: DiscoveryQuery) {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${query.industry} businesses in ${query.location}`,
        num: query.targetCount * 2, // Get extra for filtering
        type: 'places',
      }),
    });

    const data = await response.json();
    return data.places || [];
  }

  private async qualifyLeads(searchResults: any[], query: DiscoveryQuery) {
    // Use Claude to analyze and qualify leads
    const prompt = `Analyze these businesses and identify the ${query.targetCount} best leads for a sales team.

Businesses:
${JSON.stringify(searchResults, null, 2)}

Criteria:
- Industry: ${query.industry}
- Location: ${query.location}
- Filters: ${JSON.stringify(query.filters || {})}

Return the top leads as a JSON array with: business_name, industry, location, phone, website, rating, review_count, opportunity_score (0-100), pain_points (array).`;

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  }

  private async enrichLeads(leads: any[]): Promise<DiscoveredLead[]> {
    // Enrich each lead with additional data
    return Promise.all(leads.map(async (lead) => {
      // Add email discovery, social media presence, etc.
      return {
        ...lead,
        source: 'google_maps' as const,
      };
    }));
  }
}
```

#### 2.2 Discovery API Endpoint
```typescript
// File: src/app/api/leads/discover/route.ts

import { NextResponse } from 'next/server';
import { AILeadDiscovery } from '@/lib/ai-lead-discovery-v2';
import { createLead } from '@/lib/leads-sqlite';

export async function POST(request: Request) {
  try {
    const { industry, location, targetCount } = await request.json();

    const discovery = new AILeadDiscovery();
    const leads = await discovery.discoverLeads({
      industry,
      location,
      targetCount: targetCount || 10,
    });

    // Save discovered leads to database
    const savedLeads = await Promise.all(
      leads.map(lead => createLead({
        business_name: lead.business_name,
        industry: lead.industry,
        location: lead.location,
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        rating: lead.rating,
        review_count: lead.review_count,
        website_score: 0,
        social_presence: null,
        ad_presence: false,
        opportunity_score: 0,
        pain_points: [],
        recommended_services: [],
        ai_summary: null,
        lat: null,
        lng: null,
        added_by: 'ai-discovery',
        source: lead.source,
      }))
    );

    return NextResponse.json({
      success: true,
      count: savedLeads.length,
      leads: savedLeads,
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover leads' },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Lead Enrichment & Scoring (Priority: HIGH)

#### 3.1 Enrichment Pipeline
```typescript
// File: src/lib/lead-enrichment-v2.ts

export class LeadEnrichment {
  /**
   * Enrich a lead with additional data
   */
  async enrichLead(leadId: string) {
    const lead = await getLeadById(leadId);
    if (!lead) throw new Error('Lead not found');

    // 1. Website analysis
    const websiteScore = await this.analyzeWebsite(lead.website);

    // 2. Social media presence
    const socialPresence = await this.checkSocialMedia(lead.business_name);

    // 3. Ad presence check
    const adPresence = await this.checkAdPresence(lead.business_name);

    // 4. Email discovery
    const email = await this.discoverEmail(lead.website, lead.business_name);

    // Update lead with enriched data
    await updateLead(leadId, {
      website_score: websiteScore,
      social_presence: socialPresence,
      ad_presence: adPresence,
      email: email || lead.email,
      enriched_at: new Date().toISOString(),
    });

    // 5. Score the lead
    await this.scoreLead(leadId);
  }

  private async scoreLead(leadId: string) {
    const lead = await getLeadById(leadId);
    if (!lead) return;

    // Calculate opportunity score based on multiple factors
    let score = 0;

    // Rating factor (0-20 points)
    score += (lead.rating / 5) * 20;

    // Review count factor (0-20 points)
    score += Math.min(lead.review_count / 50, 1) * 20;

    // Website quality (0-20 points)
    score += (lead.website_score / 100) * 20;

    // Social presence (0-20 points)
    if (lead.social_presence === 'high') score += 20;
    else if (lead.social_presence === 'medium') score += 10;

    // Ad presence (0-20 points)
    if (!lead.ad_presence) score += 20; // Higher score if NOT running ads

    const opportunityScore = Math.round(score);

    await updateLead(leadId, {
      opportunity_score: opportunityScore,
      scored_at: new Date().toISOString(),
    });
  }

  private async analyzeWebsite(url?: string): Promise<number> {
    if (!url) return 0;

    try {
      // Check if website loads
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!response.ok) return 30;

      // Additional checks: SSL, mobile-friendly, speed
      return 75; // Placeholder
    } catch {
      return 0;
    }
  }

  private async checkSocialMedia(businessName: string): Promise<string | null> {
    // Check for social media presence
    // Return 'high', 'medium', 'low', or null
    return 'medium'; // Placeholder
  }

  private async checkAdPresence(businessName: string): Promise<boolean> {
    // Check if business is running ads
    return false; // Placeholder
  }

  private async discoverEmail(website?: string, businessName?: string): Promise<string | null> {
    // Try to discover contact email
    return null; // Placeholder
  }
}
```

---

### Phase 4: Frontend Dashboard (Priority: MEDIUM)

#### 4.1 Dashboard Components to Fix
**Issues:**
- Team page showing errors
- Leads not displaying
- Empty state handling

**Fix Plan:**

```typescript
// File: src/app/(app)/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { LeadTable } from "@/components/dashboard/lead-table";
import { LeadFilters } from "@/components/dashboard/lead-filters";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Lead, LeadFilter } from "@/types";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [filter, setFilter] = useState<LeadFilter>({});

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  async function fetchLeads() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.search) params.append('search', filter.search);
      if (filter.industries) params.append('industries', filter.industries.join(','));
      if (filter.scoreRange) {
        params.append('scoreMin', String(filter.scoreRange[0]));
        params.append('scoreMax', String(filter.scoreRange[1]));
      }

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error('Invalid leads data:', data);
        setLeads([]);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  async function discoverLeads() {
    if (discovering) return;

    try {
      setDiscovering(true);
      const response = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'Restaurant',
          location: 'San Diego, CA',
          targetCount: 25,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchLeads(); // Refresh the list
      }
    } catch (error) {
      console.error('Discovery failed:', error);
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Lead Dashboard</h1>
          <Button
            onClick={discoverLeads}
            disabled={discovering}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {discovering ? 'Discovering...' : 'Discover Leads'}
          </Button>
        </div>

        <SummaryCards leads={leads} />
        <LeadFilters onChange={setFilter} />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <Sparkles className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
            <p className="text-slate-400 mb-6">Click "Discover Leads" to find qualified prospects using AI</p>
            <Button
              onClick={discoverLeads}
              disabled={discovering}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Start Discovering
            </Button>
          </div>
        ) : (
          <LeadTable leads={leads} onUpdate={fetchLeads} />
        )}
      </div>
    </div>
  );
}
```

---

### Phase 5: Testing & Quality Assurance (Priority: HIGH)

#### 5.1 Test Checklist

**Database Tests:**
- [ ] Local SQLite works
- [ ] Production Neon works
- [ ] Team CRUD operations
- [ ] Lead CRUD operations
- [ ] Queries with filters work

**API Tests:**
- [ ] GET /api/team returns team data
- [ ] GET /api/leads returns leads array
- [ ] POST /api/leads/discover creates new leads
- [ ] All endpoints handle errors gracefully

**Frontend Tests:**
- [ ] Dashboard loads without errors
- [ ] Team page loads without errors
- [ ] Leads display correctly
- [ ] Filters work
- [ ] Discovery button triggers lead creation

**Integration Tests:**
- [ ] Full lead discovery flow works
- [ ] Lead enrichment works
- [ ] Lead scoring works
- [ ] Data persists correctly

---

### Phase 6: Deployment & Monitoring (Priority: MEDIUM)

#### 6.1 Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Database schema migrated to Neon
- [ ] Initial team created in production
- [ ] Error tracking configured
- [ ] Performance monitoring set up

#### 6.2 Post-Deployment Verification
- [ ] Production site loads
- [ ] APIs respond correctly
- [ ] Lead discovery works in production
- [ ] No console errors
- [ ] Database operations successful

---

## 🚀 EXECUTION SEQUENCE

### Step 1: Database Setup (30 minutes)
1. Run Neon migration script
2. Verify schema in production
3. Create default team/member
4. Test database connectivity

### Step 2: AI Discovery Integration (2 hours)
1. Implement `AILeadDiscovery` class
2. Create discovery API endpoint
3. Test discovery locally
4. Deploy and test in production

### Step 3: Enrichment Pipeline (1 hour)
1. Implement `LeadEnrichment` class
2. Create enrichment API endpoint
3. Test enrichment flow
4. Verify scoring algorithm

### Step 4: Frontend Fixes (1 hour)
1. Fix team page error handling
2. Update dashboard with discovery button
3. Add empty state handling
4. Test all pages

### Step 5: End-to-End Testing (30 minutes)
1. Test complete discovery flow
2. Verify data persistence
3. Check error handling
4. Performance testing

### Step 6: Production Deployment (15 minutes)
1. Deploy to Vercel
2. Run post-deployment tests
3. Monitor logs
4. Document any issues

---

## 📊 SUCCESS METRICS

**Technical:**
- [ ] All API endpoints return < 500ms
- [ ] Zero client-side errors
- [ ] 100% uptime for 24 hours
- [ ] Database queries optimized (< 100ms)

**Functional:**
- [ ] Can discover 25+ leads in < 60 seconds
- [ ] Lead enrichment works for 90%+ of leads
- [ ] Scoring algorithm accurate
- [ ] Dashboard loads and displays data

**User Experience:**
- [ ] No loading spinners > 3 seconds
- [ ] Clear error messages
- [ ] Intuitive navigation
- [ ] Beautiful UI that matches design

---

## 🔧 ENVIRONMENT VARIABLES REQUIRED

```bash
# Production (.env.production)
POSTGRES_URL=postgresql://... # Neon database URL
ANTHROPIC_API_KEY=sk-ant-... # Claude API key
SERPER_API_KEY=... # Serper API key for search
TWILIO_ACCOUNT_SID=... # Twilio for calling
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
NEXT_PUBLIC_APP_URL=https://leadly-...vercel.app
```

---

## 💡 KEY ARCHITECTURAL DECISIONS

1. **Dual-Mode Database**: SQLite (dev) + Neon Postgres (prod)
   - Rationale: Fast local development, scalable production

2. **AI-First Discovery**: Claude + Serper for lead generation
   - Rationale: High-quality leads vs scraping junk data

3. **Async Enrichment**: Queue-based lead processing
   - Rationale: Don't block user while enriching

4. **API-First Frontend**: All data via REST APIs
   - Rationale: Clean separation, easier testing

5. **Neon Serverless**: PostgreSQL without management
   - Rationale: Auto-scaling, no DevOps overhead

---

## 🎯 IMMEDIATE ACTION ITEMS

**PRIORITY 1 (Do First):**
1. Create and run `scripts/migrate-neon-schema.ts`
2. Verify production database has tables + default team
3. Test `/api/team` and `/api/leads` endpoints
4. Fix any team page errors with proper error boundaries

**PRIORITY 2 (Do Next):**
1. Implement `AILeadDiscovery` class
2. Create `/api/leads/discover` endpoint
3. Add discovery button to dashboard
4. Test full discovery flow

**PRIORITY 3 (Polish):**
1. Implement lead enrichment
2. Add lead scoring
3. Optimize performance
4. Add monitoring

---

## 📝 NOTES & GOTCHAS

- Neon uses template literal syntax: `sql\`query\`` not `sql('query')`
- JSONB columns in Postgres vs TEXT in SQLite for `pain_points`
- Boolean columns: `BOOLEAN` in Postgres vs `INTEGER` in SQLite
- Always wrap Postgres timestamps in proper types
- Remember to handle empty states gracefully
- AI discovery costs money - rate limit appropriately

---

## 🎬 MASTER EXECUTION PROMPT

**Copy this into your next message:**

```
Execute complete Leadly.AI production rebuild following MASTER_REBUILD_PROMPT.md:

1. Create and run scripts/migrate-neon-schema.ts to setup production database
2. Verify Neon database schema and create default team
3. Implement src/lib/ai-lead-discovery-v2.ts with full AI discovery
4. Create src/app/api/leads/discover/route.ts endpoint
5. Fix dashboard page with discovery button and empty states
6. Test complete flow: discovery → database → display
7. Deploy to production and verify everything works

Focus on: Clean error handling, beautiful UX, fast performance.
Test after each step. Deploy when all tests pass.

Let's build this right. Execute now.
```

---

## END OF MASTER PROMPT
