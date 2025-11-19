# Leadly.AI - Quick Start Guide 🚀

## 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- Supabase account
- API keys ready (Google Maps, Yelp, OpenAI, Mapbox)

---

## Step 1: Install Dependencies

```bash
cd leadly-ai
npm install
```

---

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local  # or use your preferred editor
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `GOOGLE_MAPS_API_KEY`
- `YELP_API_KEY`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Step 3: Set Up Database

### Option A: Supabase CLI (Recommended)

```bash
# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option B: Manual (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_team_avail.sql`
   - `supabase/migrations/003_seed_100_authentic_leads.sql` ⭐ NEW!

---

## Step 4: Verify Database

Run this query in Supabase SQL Editor:

```sql
SELECT COUNT(*) as total_leads FROM leads;
```

**Expected Result:** `total_leads: 100+`

---

## Step 5: Start Development Server

```bash
npm run dev
```

Open browser to: **http://localhost:3000**

---

## Step 6: Explore New Features 🎯

### 1. Check Rebranding
- Look for "LEADLY.AI" logo in sidebar (top-left)
- Click "Leadly.AI" in navigation (replaces "Dashboard")
- Verify page title says "Leadly.AI"

### 2. View Seed Leads
- Click "Lead Table" tab
- Scroll through 100 pre-loaded leads
- Notice realistic data (businesses, locations, ratings)

### 3. Try Search Engine ⭐ NEW FEATURE
- Click "Search Engine" tab
- Select industry (e.g., "HVAC")
- Enter location (e.g., "San Diego, CA")
- Click "Search Leads"
- View real-time results
- Select leads and click "Import Selected"
- Export results to CSV

### 4. Test Filters
- Adjust rating slider (3.0 - 5.0)
- Adjust review count range
- Adjust opportunity score
- See results update

---

## What's New? ✨

### 🎨 Complete Rebrand
- "AVAIL" → "Leadly.AI" everywhere
- Updated navigation labels
- Consistent branding

### 📊 100 Authentic Seed Leads
- 9 different industries
- Real US locations
- Authentic business data
- Contextual pain points
- AI-generated summaries

### 🔍 Advanced Search Engine
- Multi-source search (Google Maps, Yelp, Apollo)
- Real-time filtering
- Batch import
- CSV export
- Search history

### 🛠️ Infrastructure Improvements
- Error handling system
- Performance caching
- Loading states & skeletons
- Better UX

---

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Common Issues

### "No leads found"
**Solution:** Run database migration `003_seed_100_authentic_leads.sql`

### "API key error"
**Solution:** Check `.env.local` has all required keys

### "Supabase connection failed"
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and anon key

### "Search returns no results"
**Solution:** Verify Google Maps and Yelp API keys are valid

---

## File Structure

```
leadly-ai/
├── src/
│   ├── app/(app)/
│   │   └── dashboard/
│   │       └── page.tsx               # Main dashboard (updated)
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── lead-search-engine.tsx # NEW: Search engine
│   │   ├── layout/
│   │   │   └── sidebar.tsx            # Updated branding
│   │   └── ui/
│   │       └── loading-states.tsx     # NEW: Skeletons
│   └── lib/
│       ├── cache.ts                   # NEW: Caching
│       └── error-handler.ts           # NEW: Error handling
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_seed_team_avail.sql
│       └── 003_seed_100_authentic_leads.sql  # NEW: 100 leads
├── .env.local                         # Your config
└── package.json
```

---

## Next Steps

1. ✅ Complete setup above
2. ✅ Run testing checklist in `IMPLEMENTATION_COMPLETE.md`
3. ✅ Customize seed leads if needed
4. ✅ Deploy to Vercel/production

---

## 🎉 You're Ready!

Your Leadly.AI platform is now:
- ✅ Fully branded
- ✅ Populated with 100 realistic leads
- ✅ Equipped with powerful search
- ✅ Optimized for performance

**Start exploring and happy selling! 🚀**

---

## Support

- 📖 Full documentation: `IMPLEMENTATION_COMPLETE.md`
- 📋 Detailed setup: `SETUP.md`
- 🐛 Issues: Check console for errors
- 💡 Tips: See `IMPLEMENTATION_COMPLETE.md` for pro tips

**Built with ❤️ for Leadly.AI**
