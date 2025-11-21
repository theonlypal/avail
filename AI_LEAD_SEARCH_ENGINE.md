# AI-Powered Lead Search Engine - Architecture & Implementation

## Executive Summary

This document outlines the design and implementation of a next-generation AI-powered lead discovery and qualification system for Leadly.AI. The system combines multiple data sources, AI scoring, and intelligent enrichment to provide real, actionable leads.

## Current Problem

The existing lead search system:
- Generates fake/mock data instead of real businesses
- Has no integration with real business directories (Google Places, Yelp, etc.)
- Lacks AI-powered lead scoring and qualification
- Doesn't enrich leads with actionable intelligence
- Missing personalization and context for outreach

## Solution Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Lead Search Engine                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ Data Sources  │  │  AI Analysis  │  │ Enrichment    │  │
│  │               │  │               │  │               │  │
│  │ • Google      │  │ • Scoring     │  │ • Contact     │  │
│  │   Places      │──▶│ • Qualify     │──▶│   Details     │  │
│  │ • Yelp        │  │ • Insights    │  │ • Decision    │  │
│  │ • LinkedIn    │  │ • Reasoning   │  │   Makers      │  │
│  │ • Web Scrape  │  │               │  │ • Buying      │  │
│  └───────────────┘  └───────────────┘  │   Signals     │  │
│                                         └───────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Lead Database (PostgreSQL)                 │ │
│  │  • Full Business Details  • AI Scores  • Enrichment   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 1. Multi-Source Lead Discovery

### 1.1 Google Places API Integration

**Purpose**: Real business discovery from Google's comprehensive database

**Implementation**:
```typescript
// src/lib/discovery/google-places.ts

export interface GooglePlacesSearchParams {
  query?: string;
  location?: string;
  radius?: number; // meters
  category?: string; // e.g., "restaurant", "retail_store"
  minRating?: number;
  priceLevel?: string[];
}

export async function searchGooglePlaces(
  params: GooglePlacesSearchParams
): Promise<RawLead[]> {
  // 1. Nearby Search or Text Search API
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

  const response = await fetch(placesUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: params.location,
      radius: params.radius || 5000,
      type: params.category,
      key: process.env.GOOGLE_PLACES_API_KEY
    })
  });

  const data = await response.json();

  // 2. Get Place Details for each result
  const leads = await Promise.all(
    data.results.map(async (place: any) => {
      const details = await getPlaceDetails(place.place_id);

      return {
        name: place.name,
        address: place.vicinity,
        phone: details.formatted_phone_number,
        website: details.website,
        rating: place.rating,
        reviews_count: place.user_ratings_total,
        google_maps_url: details.url,
        business_type: place.types,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        opening_hours: details.opening_hours,
        photos: details.photos,
        source: 'google_places'
      };
    })
  );

  return leads;
}
```

### 1.2 Yelp Fusion API Integration

**Purpose**: Additional business data, reviews, and category insights

```typescript
// src/lib/discovery/yelp.ts

export async function searchYelp(
  params: YelpSearchParams
): Promise<RawLead[]> {
  const yelpUrl = 'https://api.yelp.com/v3/businesses/search';

  const response = await fetch(yelpUrl, {
    headers: {
      'Authorization': `Bearer ${process.env.YELP_API_KEY}`
    },
    params: {
      location: params.location,
      categories: params.categories,
      limit: params.limit || 50,
      sort_by: 'rating'
    }
  });

  const data = await response.json();

  return data.businesses.map((business: any) => ({
    name: business.name,
    address: business.location.display_address.join(', '),
    phone: business.phone,
    website: business.url,
    rating: business.rating,
    reviews_count: business.review_count,
    price_range: business.price,
    categories: business.categories.map((c: any) => c.title),
    photos: business.photos,
    source: 'yelp'
  }));
}
```

### 1.3 LinkedIn Company Search

**Purpose**: B2B lead discovery and company insights

```typescript
// src/lib/discovery/linkedin.ts

export async function searchLinkedInCompanies(
  params: LinkedInSearchParams
): Promise<RawLead[]> {
  // Using LinkedIn Sales Navigator API or RapidAPI LinkedIn endpoints
  // Provides: company size, industry, employee count, growth signals

  return companies.map(company => ({
    name: company.name,
    industry: company.industry,
    company_size: company.employee_count_range,
    website: company.website_url,
    linkedin_url: company.url,
    founded_year: company.founded,
    specialties: company.specialties,
    recent_hires: company.growth_signals,
    source: 'linkedin'
  }));
}
```

## 2. AI-Powered Lead Scoring

### 2.1 Scoring System

**Purpose**: Rank leads by opportunity quality (0-100 score)

**Scoring Factors**:
1. **Fit Score** (40 points) - How well they match ICP
   - Industry alignment
   - Company size
   - Location/geography
   - Technology stack

2. **Engagement Score** (30 points) - Likelihood to engage
   - Recent activity/growth signals
   - Online presence quality
   - Review sentiment
   - Responsiveness indicators

3. **Intent Score** (20 points) - Buying signals
   - Hiring activity
   - Recent funding
   - Website changes
   - Technology adoption

4. **Reachability Score** (10 points) - Contact accessibility
   - Email availability
   - Decision maker presence
   - Company size (smaller = easier)

### 2.2 AI Scoring Implementation

```typescript
// src/lib/ai/lead-scoring.ts

import Anthropic from '@anthropic-ai/sdk';

export async function scoreLeadWithAI(
  lead: EnrichedLead,
  icpCriteria: ICPCriteria
): Promise<LeadScore> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = `You are a B2B sales intelligence analyst. Analyze this lead and provide a detailed scoring and qualification.

IDEAL CUSTOMER PROFILE:
${JSON.stringify(icpCriteria, null, 2)}

LEAD DATA:
${JSON.stringify(lead, null, 2)}

Provide a JSON response with:
{
  "overall_score": 0-100,
  "fit_score": 0-40,
  "engagement_score": 0-30,
  "intent_score": 0-20,
  "reachability_score": 0-10,
  "reasoning": "Detailed explanation of scoring",
  "strengths": ["Array of positive signals"],
  "concerns": ["Array of red flags or concerns"],
  "recommended_approach": "Best outreach strategy",
  "talking_points": ["Key points to mention in outreach"],
  "estimated_deal_size": "Small/Medium/Large/Enterprise",
  "decision_timeline": "Immediate/Short-term/Long-term"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const response = JSON.parse(message.content[0].text);

  return {
    lead_id: lead.id,
    overall_score: response.overall_score,
    fit_score: response.fit_score,
    engagement_score: response.engagement_score,
    intent_score: response.intent_score,
    reachability_score: response.reachability_score,
    reasoning: response.reasoning,
    strengths: response.strengths,
    concerns: response.concerns,
    recommended_approach: response.recommended_approach,
    talking_points: response.talking_points,
    estimated_deal_size: response.estimated_deal_size,
    decision_timeline: response.decision_timeline,
    scored_at: new Date().toISOString()
  };
}
```

## 3. Lead Enrichment System

### 3.1 Contact Discovery

```typescript
// src/lib/enrichment/contacts.ts

export async function enrichLeadWithContacts(
  lead: Lead
): Promise<ContactInfo[]> {
  // Use APIs like:
  // - Hunter.io (email finding)
  // - Apollo.io (contact database)
  // - Clearbit (company enrichment)
  // - ZoomInfo (B2B data)

  const contacts = await Promise.all([
    findEmailsWithHunter(lead.domain),
    findContactsWithApollo(lead.name),
    enrichWithClearbit(lead.domain)
  ]);

  return contacts.flatMap(c => c);
}
```

### 3.2 Buying Signals Detection

```typescript
// src/lib/enrichment/buying-signals.ts

export async function detectBuyingSignals(
  lead: Lead
): Promise<BuyingSignal[]> {
  const signals: BuyingSignal[] = [];

  // 1. Recent funding
  const funding = await checkRecentFunding(lead.name);
  if (funding) {
    signals.push({
      type: 'funding',
      description: `Raised ${funding.amount} in ${funding.round}`,
      impact: 'high',
      detected_at: funding.date
    });
  }

  // 2. Hiring activity
  const jobs = await checkJobPostings(lead.linkedin_url);
  if (jobs.length > 0) {
    signals.push({
      type: 'hiring',
      description: `${jobs.length} open positions`,
      impact: 'medium',
      detected_at: new Date().toISOString()
    });
  }

  // 3. Technology changes
  const techChanges = await detectTechStackChanges(lead.website);
  if (techChanges.length > 0) {
    signals.push({
      type: 'tech_adoption',
      description: `Recently adopted: ${techChanges.join(', ')}`,
      impact: 'high',
      detected_at: new Date().toISOString()
    });
  }

  // 4. Website activity
  const webActivity = await analyzeWebsiteActivity(lead.website);
  if (webActivity.score > 70) {
    signals.push({
      type: 'web_activity',
      description: 'High website update frequency',
      impact: 'low',
      detected_at: new Date().toISOString()
    });
  }

  return signals;
}
```

## 4. Search Interface Design

### 4.1 Advanced Search UI

```tsx
// src/components/lead-search/AdvancedLeadSearch.tsx

export function AdvancedLeadSearch() {
  return (
    <div className="space-y-6">
      {/* Search Criteria */}
      <div className="grid grid-cols-3 gap-4">
        {/* Location */}
        <div>
          <label>Location</label>
          <input
            type="text"
            placeholder="City, State or ZIP"
            className="..."
          />
          <input
            type="number"
            placeholder="Radius (miles)"
            className="..."
          />
        </div>

        {/* Industry */}
        <div>
          <label>Industry/Category</label>
          <select multiple>
            <option>Restaurants</option>
            <option>Retail</option>
            <option>Healthcare</option>
            <option>Technology</option>
            <option>Professional Services</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label>Company Size</label>
          <select>
            <option>1-10 employees</option>
            <option>11-50 employees</option>
            <option>51-200 employees</option>
            <option>201-500 employees</option>
            <option>500+ employees</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label>Min Rating</label>
          <input type="number" step="0.1" min="0" max="5" />
        </div>

        <div>
          <label>Min Reviews</label>
          <input type="number" />
        </div>

        <div>
          <label>Has Website</label>
          <input type="checkbox" />
        </div>

        <div>
          <label>Recently Active</label>
          <input type="checkbox" />
        </div>
      </div>

      {/* AI-Powered Filters */}
      <div>
        <label>AI Qualification Criteria</label>
        <textarea
          placeholder="Describe your ideal customer in natural language. E.g., 'Growing SaaS companies in California with 20-100 employees that recently raised funding'..."
          rows={3}
        />
      </div>

      {/* Search Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700">
        Search Leads (AI-Powered)
      </button>
    </div>
  );
}
```

### 4.2 Results Display

```tsx
// src/components/lead-search/LeadSearchResults.tsx

export function LeadSearchResults({ leads }: { leads: ScoredLead[] }) {
  return (
    <div className="space-y-4">
      {leads.map(lead => (
        <div key={lead.id} className="border rounded-lg p-6">
          {/* Lead Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{lead.name}</h3>
              <p className="text-gray-600">{lead.industry}</p>
              <p className="text-sm text-gray-500">{lead.address}</p>
            </div>

            {/* AI Score Badge */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                lead.score >= 80 ? 'text-green-500' :
                lead.score >= 60 ? 'text-yellow-500' :
                'text-gray-500'
              }`}>
                {lead.score}
              </div>
              <div className="text-xs text-gray-500">AI Score</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-sm text-gray-600">Rating</div>
              <div className="font-semibold">{lead.rating} ⭐</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Reviews</div>
              <div className="font-semibold">{lead.reviews_count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Employees</div>
              <div className="font-semibold">{lead.employee_count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Deal Size</div>
              <div className="font-semibold">{lead.estimated_deal_size}</div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-900 mb-2">
              AI Insights
            </div>
            <p className="text-sm text-blue-800">{lead.ai_reasoning}</p>

            {/* Strengths */}
            {lead.strengths.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-green-700">Strengths:</div>
                <ul className="text-xs text-green-600 list-disc list-inside">
                  {lead.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buying Signals */}
            {lead.buying_signals.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-purple-700">Buying Signals:</div>
                <div className="flex gap-2 mt-1">
                  {lead.buying_signals.map((signal, i) => (
                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {signal.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded">
              View Details
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 rounded">
              Add to Pipeline
            </button>
            <button className="px-4 bg-gray-200 rounded">
              Generate Outreach
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 5. Database Schema

```sql
-- Enhanced leads table
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  industry TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Business Details
  business_type TEXT[],
  company_size TEXT,
  employee_count_range TEXT,
  annual_revenue_range TEXT,
  founded_year INTEGER,

  -- Online Presence
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  google_maps_url TEXT,
  yelp_url TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,

  -- Location Data
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- AI Scoring
  overall_score INTEGER,
  fit_score INTEGER,
  engagement_score INTEGER,
  intent_score INTEGER,
  reachability_score INTEGER,
  ai_reasoning TEXT,

  -- Qualification
  strengths TEXT[],
  concerns TEXT[],
  estimated_deal_size TEXT,
  decision_timeline TEXT,
  recommended_approach TEXT,
  talking_points TEXT[],

  -- Enrichment
  contacts JSONB,
  buying_signals JSONB,
  tech_stack TEXT[],

  -- Metadata
  source TEXT, -- 'google_places', 'yelp', 'linkedin', etc.
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_enriched_at TIMESTAMP,
  last_scored_at TIMESTAMP,

  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'qualified', 'contacted', 'nurture', 'won', 'lost'
  assigned_to TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_score ON leads(overall_score DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_location ON leads(city, state);
CREATE INDEX idx_leads_industry ON leads(industry);
```

## 6. Implementation Timeline

### Phase 1: Data Sources (Week 1-2)
- [x] Set up Google Places API integration
- [ ] Implement Yelp Fusion API
- [ ] Add LinkedIn company search
- [ ] Create unified lead ingestion pipeline

### Phase 2: AI Scoring (Week 2-3)
- [ ] Build AI scoring system with Claude
- [ ] Implement ICP matching logic
- [ ] Create scoring UI and visualizations
- [ ] Add score explanations and insights

### Phase 3: Enrichment (Week 3-4)
- [ ] Integrate contact discovery APIs
- [ ] Implement buying signals detection
- [ ] Add tech stack identification
- [ ] Create enrichment scheduler

### Phase 4: Search Interface (Week 4-5)
- [ ] Build advanced search UI
- [ ] Implement real-time filtering
- [ ] Add AI-powered search queries
- [ ] Create results visualization

### Phase 5: Testing & Optimization (Week 5-6)
- [ ] Load testing with real data
- [ ] Optimize API rate limits
- [ ] Tune AI scoring prompts
- [ ] Performance optimization

## 7. API Keys Required

```env
# Google Places API
GOOGLE_PLACES_API_KEY=

# Yelp Fusion API
YELP_API_KEY=

# LinkedIn (RapidAPI or Sales Navigator)
LINKEDIN_API_KEY=

# Contact Enrichment
HUNTER_IO_API_KEY=
APOLLO_IO_API_KEY=
CLEARBIT_API_KEY=

# Already have
ANTHROPIC_API_KEY=
```

## 8. Cost Estimation

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Google Places API | 10,000 searches | $200 |
| Yelp Fusion API | 5,000 searches | $0 (free tier) |
| Hunter.io | 1,000 searches | $49 |
| Apollo.io | 2,000 contacts | $0 (free tier) |
| Anthropic Claude | 50,000 API calls | $150 |
| **Total** | | **~$400/month** |

## 9. Success Metrics

1. **Data Quality**
   - 100% real businesses (no fake data)
   - 95%+ data accuracy
   - 80%+ leads with contact info

2. **AI Performance**
   - Scoring accuracy: 85%+
   - User score agreement: 80%+
   - Conversion rate lift: 40%+

3. **User Engagement**
   - Time to find qualified lead: <5 minutes
   - Leads per search session: 10+
   - Lead-to-opportunity ratio: 20%+

## Next Steps

1. Set up API accounts and get keys
2. Implement Google Places integration first (highest ROI)
3. Build basic AI scoring system
4. Create MVP search interface
5. Test with real user searches
6. Iterate based on feedback
