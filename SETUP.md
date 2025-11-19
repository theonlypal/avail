# 🚀 Leadly.AI Setup Guide

Complete setup instructions for getting Leadly.AI running in production with real data.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account
- API keys for external services (see below)

---

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `leadly-ai` (or your choice)
   - **Database password**: Choose a strong password
   - **Region**: Select closest to your users
4. Wait 2-3 minutes for project creation

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and paste it
4. Click **"Run"** - this creates all tables, RLS policies, and triggers
5. Repeat for `supabase/migrations/002_seed_team_avail.sql` - this seeds Team Avail

### 1.3 Get Supabase Credentials

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (⚠️ Keep this secret!)

---

## 🔑 Step 2: Get API Keys

### 2.1 OpenAI (Required for AI scoring/outreach)

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy the key → `OPENAI_API_KEY`

**Cost**: ~$0.01 per 100 leads scored

### 2.2 Anthropic Claude (Optional, alternative to OpenAI)

1. Go to [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **"Create Key"**
3. Copy the key → `ANTHROPIC_API_KEY`

**Cost**: ~$0.015 per 100 leads scored

### 2.3 Google Maps API (Required for lead search)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - **Places API**
   - **Geocoding API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the key → `GOOGLE_MAPS_API_KEY`
6. **Restrict the key** (recommended):
   - Set **Application restrictions** to your domain
   - Set **API restrictions** to Places & Geocoding APIs only

**Cost**: $0 (free tier includes 28,500 requests/month)

### 2.4 Yelp Fusion API (Required for lead search)

1. Go to [https://www.yelp.com/developers/v3/manage_app](https://www.yelp.com/developers/v3/manage_app)
2. Click **"Create New App"**
3. Fill in app details
4. Copy the **API Key** → `YELP_API_KEY`

**Cost**: Free (5,000 requests/day)

### 2.5 Mapbox (Required for analytics heatmap)

1. Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Click **"Create a token"**
3. Select **Public scopes** (for frontend) and **Secret scopes** (for backend)
4. Copy the token → `NEXT_PUBLIC_MAPBOX_TOKEN` and `MAPBOX_TOKEN`

**Cost**: Free (50,000 map loads/month)

### 2.6 Clearbit (Optional, for data enrichment)

1. Go to [https://clearbit.com](https://clearbit.com)
2. Sign up for an account
3. Get API key from dashboard → `CLEARBIT_KEY`

**Cost**: Paid plans start at $99/month

### 2.7 BuiltWith (Optional, for tech stack detection)

1. Go to [https://builtwith.com/api](https://builtwith.com/api)
2. Sign up for API access
3. Copy API key → `BUILTWITH_KEY`

**Cost**: Starts at $295/month

### 2.8 GoHighLevel (Required for CRM sync)

1. Log into your GoHighLevel account
2. Go to **Settings** → **Integrations** → **API**
3. Generate or copy your API key → `GOHIGHLEVEL_API_KEY`

---

## ⚙️ Step 3: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in all the API keys you collected:
   ```bash
   # Database (REQUIRED)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_KEY=eyJ...

   # AI Services (REQUIRED)
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...

   # Lead Discovery (REQUIRED)
   GOOGLE_MAPS_API_KEY=AIza...
   YELP_API_KEY=...

   # Enrichment (OPTIONAL)
   CLEARBIT_KEY=...
   BUILTWITH_KEY=...

   # CRM (REQUIRED)
   GOHIGHLEVEL_API_KEY=...

   # Maps (REQUIRED)
   NEXT_PUBLIC_MAPBOX_TOKEN=pk....
   MAPBOX_TOKEN=sk....
   ```

---

## 📦 Step 4: Install & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

---

## 👥 Step 5: Create User Accounts

Since the app now uses real authentication, you need to create user accounts for Team Avail:

### Option A: Sign up via UI (once you build auth pages)
1. Go to `/signup` (after creating the auth pages)
2. Sign up with emails: `zach@leadly.ai`, `ryan@leadly.ai`, `dc@leadly.ai`

### Option B: Create users manually in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create users for:
   - **Email**: `zach@leadly.ai`, **Password**: (choose one)
   - **Email**: `ryan@leadly.ai`, **Password**: (choose one)
   - **Email**: `dc@leadly.ai`, **Password**: (choose one)

4. Link users to team_members table:
   - Go to **SQL Editor**
   - Run this for each user:
     ```sql
     UPDATE team_members
     SET user_id = 'PASTE_USER_ID_HERE'
     WHERE email = 'zach@leadly.ai';
     ```
   - Get `user_id` from the Authentication → Users page

---

## 🧪 Step 6: Test the System

### 6.1 Search for Leads
1. Use the chat copilot: `"find 10 leads in San Diego for dental clinics"`
2. Or use the dashboard search filters
3. **Verify**: Leads appear from Google Maps/Yelp (not mock data)

### 6.2 Score a Lead
1. Click on a lead
2. Click **"Score Lead"** button
3. **Verify**: AI generates opportunity_score, pain_points, recommended_services

### 6.3 Generate Outreach
1. On lead detail page, click **"Generate Outreach"**
2. **Verify**: AI generates personalized email with subject + body

### 6.4 Assign Leads
1. Select a lead and assign it to a team member
2. **Verify**: Assignment persists in database

### 6.5 Analytics
1. Go to `/analytics`
2. **Verify**: Mapbox heatmap displays lead locations
3. **Verify**: Stats reflect real database counts

---

## 🚀 Step 7: Deploy to Production

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your GitHub repo
5. **Add Environment Variables**:
   - Copy all variables from `.env.local`
   - Paste them in Vercel's Environment Variables section
6. Click **"Deploy"**

### Deploy to Railway (Alternative)

1. Go to [https://railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repo
4. Add environment variables
5. Deploy

---

## 🔒 Security Notes

- **Never commit `.env.local`** to version control
- **Rotate API keys** if exposed
- **Use Row Level Security (RLS)** in Supabase (already configured)
- **Restrict Google Maps API** to your domain
- **Keep SUPABASE_SERVICE_KEY secret** (only use server-side)

---

## 🐛 Troubleshooting

### "Missing environment variable" errors
- Ensure all required variables in `.env.local` are filled
- Restart dev server after changing `.env.local`

### "Supabase connection failed"
- Verify Project URL and keys are correct
- Check if Supabase project is active

### "Lead search returns no results"
- Verify Google Maps & Yelp API keys are valid
- Check API usage quotas haven't been exceeded
- Ensure APIs are enabled in Google Cloud Console

### "AI scoring fails"
- Verify OpenAI or Anthropic API key is valid
- Check account has credits/billing enabled

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)
- [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)

---

## 🎯 Next Steps

After setup, consider:

1. **Build Authentication Pages** - Create `/login` and `/signup` pages using Supabase Auth
2. **Add Realtime Subscriptions** - Use Supabase realtime to sync lead updates across users
3. **Implement Invite System** - Allow team members to invite new users via email
4. **Schedule Automated Lead Imports** - Use cron jobs to regularly search and import new leads
5. **Set up Webhooks** - Connect GoHighLevel webhooks to sync CRM updates back to Leadly

---

## ✅ Summary Checklist

- [ ] Supabase project created
- [ ] Migrations run (001 and 002)
- [ ] All API keys collected
- [ ] `.env.local` configured
- [ ] `npm install` completed
- [ ] Dev server running
- [ ] Team Avail users created
- [ ] Lead search tested
- [ ] AI scoring tested
- [ ] Analytics heatmap working
- [ ] Ready for production deployment

**You're all set! 🎉**
