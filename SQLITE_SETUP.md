# Leadly.AI - SQLite + Real Business Scraping Setup 🚀

## What Changed?

**NO MORE SUPABASE!** Everything now runs locally with:
- ✅ **SQLite database** - Local file, no external dependencies
- ✅ **Real businesses scraped from Google & Yelp** - No fake data!
- ✅ **Automatic database setup** - Just run and go

---

## Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd leadly-ai
npm install
```

This installs:
- `better-sqlite3` - Local SQLite database
- `tsx` - TypeScript execution for scraper

---

### Step 2: Set Up API Keys

Create `.env.local`:

```bash
# Required for scraping REAL businesses
GOOGLE_MAPS_API_KEY=your_google_maps_key
YELP_API_KEY=your_yelp_key

# Optional (for other features)
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Get API Keys:**
- Google Maps: https://console.cloud.google.com/apis/credentials
- Yelp: https://www.yelp.com/developers/v3/manage_app

---

### Step 3: Scrape Real Businesses

```bash
npm run scrape
```

**This will:**
1. Create SQLite database at `data/leadly.db`
2. Scrape 100 REAL businesses from Google Maps and Yelp:
   - 15 HVAC companies
   - 15 Plumbing businesses
   - 10 Dental practices
   - 10 Law firms
   - 10 Real Estate agencies
   - 10 Restaurants
   - 10 Auto repair shops
   - 10 Hair salons
   - 10 Gyms/Fitness centers
3. Save all data to local database

**Expected output:**
```
🌐 Starting real business scraping from the internet...
Scraping HVAC businesses in San Diego, CA...
✅ Scraped 15 real businesses for HVAC
Scraping Plumbing businesses in Phoenix, AZ...
✅ Scraped 15 real businesses for Plumbing
...
🎉 Completed scraping: 100 total real businesses
✅ Saved 100/100 leads to database
```

---

### Step 4: Run the App

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## What You Get

### 100% Real Data

Every lead is a **real business** scraped from the internet with:
- ✅ **Real business names** (e.g., "Smith & Sons HVAC", "Downtown Dental")
- ✅ **Real addresses** (actual street addresses)
- ✅ **Real phone numbers** (from Google/Yelp)
- ✅ **Real ratings** (actual customer ratings)
- ✅ **Real review counts** (actual number of reviews)
- ✅ **Real websites** (actual business URLs)
- ✅ **Real coordinates** (accurate lat/lng)

### Intelligent Opportunity Scoring

The scraper **analyzes real data** to calculate opportunity scores:
- Low ratings + many reviews = High opportunity
- No website = +15 points
- Under 50 reviews = +5 points (limited presence)
- Poor rating = +20 points (needs help)

### Smart Pain Point Detection

Based on **actual business data**:
- "No dedicated website" - If business only has Yelp page
- "Low online ratings need improvement" - If rating < 4.0
- "Limited online presence" - If < 50 reviews
- "Missing online contact information" - If no phone listed

---

## File Structure

```
leadly-ai/
├── data/
│   └── leadly.db                        # SQLite database (auto-created)
├── scripts/
│   └── scrape-real-leads.ts             # Real business scraper
├── src/
│   ├── lib/
│   │   ├── db.ts                        # SQLite connection & schema
│   │   ├── real-lead-scraper.ts         # Google/Yelp scraping
│   │   └── leads-sqlite.ts              # Lead operations (replaces Supabase)
│   └── app/(app)/dashboard/page.tsx     # Uses SQLite now
└── package.json                         # Updated with sqlite3 & tsx
```

---

## How It Works

### 1. Database Initialization (`src/lib/db.ts`)
- Creates SQLite database on first run
- Sets up all tables (leads, teams, members, etc.)
- Creates default team automatically
- No manual migrations needed!

### 2. Real Business Scraping (`src/lib/real-lead-scraper.ts`)
- **Google Places API** - Fetches businesses with details
- **Yelp API** - Adds more businesses and verification
- Deduplicates by business name
- Calculates opportunity scores from real metrics
- Generates pain points from actual data
- Recommends services based on gaps

### 3. SQLite Operations (`src/lib/leads-sqlite.ts`)
- All CRUD operations for leads
- Filtering, searching, sorting
- Industry breakdown
- Statistics aggregation
- No external database needed!

---

## API Keys - What You Need

### Required (For Scraping):
- **Google Maps API Key**
  - Enable: Places API, Place Details API
  - Get from: https://console.cloud.google.com/apis/credentials
  - Free tier: $200/month credit

- **Yelp API Key**
  - Get from: https://www.yelp.com/developers/v3/manage_app
  - Free tier: 5000 calls/day

### Optional (For Other Features):
- **OpenAI API Key** - For AI summaries and scoring
- **Mapbox Token** - For map visualization
- **Anthropic API Key** - Alternative to OpenAI

---

## Troubleshooting

### "npm not found"
Make sure Node.js is installed:
```bash
node --version
npm --version
```

### "API key error"
- Check `.env.local` exists in root directory
- Verify keys are correct (no quotes, no spaces)
- For Google Maps: Enable Places API in Google Cloud Console

### "No businesses scraped"
- Verify internet connection
- Check API keys are valid
- Check API quota limits
- Try running scraper again (rate limiting)

### "Database locked"
- Stop development server: `Ctrl+C`
- Delete `data/leadly.db`
- Run `npm run scrape` again

---

## Commands

```bash
# Install dependencies
npm install

# Scrape real businesses (do this first!)
npm run scrape

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

##Re-scrape with Fresh Data

To get new businesses:

```bash
# Delete old database
rm data/leadly.db

# Scrape fresh businesses
npm run scrape

# Restart server
npm run dev
```

---

## Production Deployment

### Local/VPS Deployment:
1. Run `npm run scrape` on server
2. Run `npm run build`
3. Run `npm start`
4. Database file persists at `data/leadly.db`

### Vercel/Netlify:
⚠️ **Note:** SQLite requires filesystem access. For serverless:
- Option 1: Use libsql/turso (hosted SQLite)
- Option 2: Deploy to VPS/container with persistent storage
- Option 3: Keep for local dev, use Postgres for production

---

## Why SQLite?

✅ **No external dependencies** - Works offline
✅ **Fast** - Local file access, no network
✅ **Simple** - No server setup, no migrations
✅ **Portable** - Single file, easy backup
✅ **Free** - No hosting costs
✅ **Perfect for demos** - Real data, zero config

---

## Next Steps

1. ✅ Run `npm install`
2. ✅ Create `.env.local` with API keys
3. ✅ Run `npm run scrape` to get real businesses
4. ✅ Run `npm run dev` to start app
5. ✅ Visit http://localhost:3000
6. ✅ See 100 REAL businesses in your dashboard!

---

## 🎉 That's It!

You now have:
- ✅ Local SQLite database
- ✅ 100 real businesses from the internet
- ✅ No fake/stub data
- ✅ No external database hosting
- ✅ Everything runs locally

**Start scraping and building! 🚀**
