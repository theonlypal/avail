# AI Orchestrator Setup Guide

## ✅ What's Been Implemented

Your lead generation system now uses an **AI Orchestrator** where Claude intelligently decides which tools to use for finding businesses.

### Architecture Changes

1. **No More Fake Data** - System returns empty results when real sources fail (no sample data generation)
2. **Perplexity AI Integration** - Real-time web search with built-in intelligence
3. **Intelligent Tool Orchestration** - Claude decides which tools to use and in what order
4. **Multi-source Aggregation** - Combines results from multiple APIs

## 🔧 Available Tools

The orchestrator can choose from these tools:

- 🔍 **search_perplexity** - Perplexity AI with real-time web search (NEW!)
- 🗺️ **search_google_maps** - Google Maps Places API
- ⭐ **search_yelp** - Yelp Fusion API
- 🌐 **search_web** - General web search
- 📧 **enrich_email** - Hunter.io / Apollo.io email enrichment
- 🌐 **analyze_website** - Website analysis
- 📊 **score_opportunity** - Calculate opportunity scores
- 🏢 **research_competitors** - Competitor research

## 🚀 Testing the Orchestrator

### Step 1: API Keys Configured

Your `.env.local` file already has:
```bash
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=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
```

### Step 2: Test Searches

Go to your dashboard at http://localhost:3000/dashboard and try these queries:

#### Example 1: Basic Search
```
Find 10 HVAC companies in San Diego
```
Expected: Orchestrator will use Perplexity AI to find real HVAC businesses

#### Example 2: Filtered Search
```
Find plumbers in Los Angeles with ratings below 4 stars
```
Expected: Orchestrator will search with filters applied

#### Example 3: Specific Criteria
```
Find dental offices in San Francisco without websites
```
Expected: Orchestrator will filter for businesses missing websites

### Step 3: Monitor the Console

Watch your terminal for orchestration logs:
```
🔍 Starting AI-orchestrated business search: { industry, location, limit }
🤖 Using AI Orchestrator with query: ...
🔧 Using tool: search_perplexity
✅ Orchestrator found X businesses
🔧 Tools used: search_perplexity
💭 Reasoning: [Claude's explanation]
```

## 🎯 How It Works

1. **User enters natural language query** → "Find HVAC companies in San Diego with low ratings"
2. **Claude parses the query** → Extracts industry, location, filters
3. **AI Orchestrator starts** → Claude receives available tools
4. **Claude decides which tools to use** → "I'll use search_perplexity for real-time web data"
5. **Tools execute** → Perplexity searches the web for real businesses
6. **Results combined** → Deduplicated and scored
7. **Leads added to database** → With opportunity scores and pain points

## 🔍 Orchestrator Behavior

### Tool Selection Priority

Claude will typically choose:
1. **Perplexity AI** first (has built-in web search, no extra API needed)
2. **Google Maps** if location-specific data needed
3. **Yelp** for reviews and ratings
4. **Email enrichment** if websites are found

### Fallback Chain

If orchestrator fails:
1. Try direct Claude AI search (generates realistic data from knowledge)
2. Try API-based scrapers (Google Maps, Yelp)
3. Return empty array (no fake data)

## 📊 What You'll See in the Dashboard

Each lead will show:
- **Business Name** - Real business names
- **Location** - City, state, address
- **Contact Info** - Phone, email (if found), website
- **Ratings** - Google/Yelp ratings and review counts
- **Opportunity Score** - AI-calculated score (0-100)
- **Pain Points** - Identified issues (no website, low ratings, etc.)
- **Source** - Where the data came from (`perplexity`, `google_maps`, `yelp`, etc.)

## 🔄 Next Steps

### Optional: Add More API Keys

For even better results, add these to `.env.local`:

```bash
# Google Maps (for geocoding and place details)
GOOGLE_MAPS_API_KEY=your_key_here

# Yelp (for detailed business reviews)
YELP_API_KEY=your_key_here

# Email enrichment
HUNTER_API_KEY=your_key_here
APOLLO_API_KEY=your_key_here
```

### Testing Different Scenarios

Try these search patterns:

1. **Industry + Location**
   - "Find restaurants in Austin"
   - "Dentists in Seattle"

2. **With Filters**
   - "HVAC companies with ratings below 4.5 stars"
   - "Plumbers without websites in Denver"

3. **Specific Criteria**
   - "Find 50 automotive repair shops in Phoenix"
   - "Electricians with less than 50 reviews in Portland"

## 🐛 Troubleshooting

### No Results Found

If you see: `❌ No real business data found from any source`

Possible causes:
1. Perplexity API key invalid or expired
2. Rate limit reached
3. Network connectivity issues

Check the console logs for detailed error messages.

### Orchestrator Not Using Perplexity

If Claude doesn't choose Perplexity, it may be:
1. Choosing a better tool for the specific query
2. Perplexity API returning errors
3. Falling back to other tools

This is normal - the orchestrator is designed to be intelligent and adaptive.

## 📝 Files Modified

- `src/lib/ai-orchestrator.ts` - Main orchestrator with Perplexity integration
- `src/app/api/ai/search/route.ts` - Updated to use orchestrator
- `src/lib/claude-scraper.ts` - Removed fake data generation
- All sample data generation functions removed

## 🎉 You're Ready!

Your AI orchestrator is now live and ready to find real businesses using Perplexity AI and other tools. Test it out in the dashboard!
