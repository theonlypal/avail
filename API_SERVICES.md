# 🔑 API SERVICES & SETUP LINKS

Complete list of ALL API services you need to make Leadly.AI work. Every link takes you directly to where you need to go.

---

## ✅ REQUIRED SERVICES (Must Have)

### 1. **Supabase** (Database & Authentication)
- **Purpose**: PostgreSQL database, authentication, realtime subscriptions
- **Cost**: FREE tier (500MB database, 50,000 monthly active users)
- **Signup**: https://app.supabase.com/sign-up
- **Setup Steps**:
  1. Create account
  2. Click "New Project"
  3. Choose region closest to users
  4. Set database password
  5. Wait 2 minutes for project creation
  6. Go to **Project Settings** → **API**
  7. Copy these 3 values:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_KEY` (⚠️ Keep secret!)
- **Docs**: https://supabase.com/docs/guides/database

---

### 2. **OpenAI** (AI Scoring, Outreach, NLP)
- **Purpose**: GPT-4o-mini for lead scoring, outreach generation, function calling
- **Cost**: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens
  - **Real cost**: ~$0.01 per 100 leads scored
- **Signup**: https://platform.openai.com/signup
- **Get API Key**: https://platform.openai.com/api-keys
  1. Click "Create new secret key"
  2. Name it "Leadly AI"
  3. Copy key → `OPENAI_API_KEY`
  4. ⚠️ Add billing: https://platform.openai.com/account/billing/overview
- **Models Used**: `gpt-4o-mini`
- **Docs**: https://platform.openai.com/docs/introduction

**OR use Anthropic Claude instead ↓**

### 2B. **Anthropic** (Alternative AI Provider)
- **Purpose**: Claude 3.5 Sonnet for lead scoring, outreach generation
- **Cost**: ~$3 per 1M input tokens, $15 per 1M output tokens
  - **Real cost**: ~$0.02 per 100 leads scored
- **Signup**: https://console.anthropic.com
- **Get API Key**: https://console.anthropic.com/settings/keys
  1. Click "Create Key"
  2. Name it "Leadly AI"
  3. Copy key → `ANTHROPIC_API_KEY`
- **Models Used**: `claude-3-5-sonnet-20241022`
- **Docs**: https://docs.anthropic.com/claude/docs/intro-to-claude

---

### 3. **Google Maps Platform** (Lead Discovery)
- **Purpose**: Search for businesses via Places API
- **Cost**: FREE tier (28,500 map loads/month, $200 free credit/month)
  - **Real cost**: Places Text Search = $32 per 1,000 requests
  - **Your cost**: With $200 credit = ~6,000 searches/month FREE
- **Signup**: https://console.cloud.google.com
- **Setup Steps**:
  1. Create Google Cloud account
  2. Create new project: https://console.cloud.google.com/projectcreate
  3. Enable billing: https://console.cloud.google.com/billing
  4. Enable APIs:
     - Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
     - Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
  5. Create API key: https://console.cloud.google.com/apis/credentials
     - Click "Create Credentials" → "API Key"
     - Copy key → `GOOGLE_MAPS_API_KEY`
  6. **⚠️ Restrict the key** (IMPORTANT):
     - Click "Edit API key"
     - **Application restrictions**: Set to your domain or None (for testing)
     - **API restrictions**: Select "Restrict key" → Choose:
       - Places API
       - Geocoding API
     - Click "Save"
- **Docs**: https://developers.google.com/maps/documentation/places/web-service/search-text

---

### 4. **Yelp Fusion API** (Lead Discovery)
- **Purpose**: Search for local businesses with ratings & reviews
- **Cost**: FREE (5,000 requests/day)
- **Signup**: https://www.yelp.com/signup
- **Create App**: https://www.yelp.com/developers/v3/manage_app
  1. Fill in app details (any name/description)
  2. Copy **API Key** → `YELP_API_KEY`
- **Docs**: https://www.yelp.com/developers/documentation/v3/business_search

---

### 5. **Mapbox** (Analytics Heatmap)
- **Purpose**: Geographic visualization of leads on map
- **Cost**: FREE tier (50,000 map loads/month)
- **Signup**: https://account.mapbox.com/auth/signup/
- **Get Token**: https://account.mapbox.com/access-tokens/
  1. Click "Create a token"
  2. Name it "Leadly Heatmap"
  3. Select **Public scopes** (for frontend)
  4. Copy token → `NEXT_PUBLIC_MAPBOX_TOKEN` AND `MAPBOX_TOKEN`
- **Docs**: https://docs.mapbox.com/mapbox-gl-js/guides/

---

### 6. **GoHighLevel** (CRM Integration)
- **Purpose**: Sync leads to your CRM
- **Cost**: Depends on your GHL plan
- **Get API Key**:
  1. Log into your GoHighLevel account
  2. Go to **Settings** → **Integrations** → **API**
  3. Generate or copy API key → `GOHIGHLEVEL_API_KEY`
- **Docs**: https://highlevel.stoplight.io/docs/integrations/

---

## ⚠️ OPTIONAL SERVICES (Enhance Functionality)

### 7. **Clearbit** (Company Enrichment)
- **Purpose**: Get company data (employee count, revenue, tech stack)
- **Cost**: Paid plans start at $99/month (no free tier)
- **Signup**: https://clearbit.com/
- **Get API Key**: https://dashboard.clearbit.com/api
- **Docs**: https://clearbit.com/docs

---

### 8. **BuiltWith** (Tech Stack Detection)
- **Purpose**: Detect technologies used on websites
- **Cost**: Starts at $295/month (no free tier)
- **Signup**: https://builtwith.com/plans
- **Get API Key**: https://api.builtwith.com/
- **Docs**: https://api.builtwith.com/domain-api

---

### 9. **Hunter.io** (Email Finder - NEW)
- **Purpose**: Find email addresses for businesses
- **Cost**: FREE tier (25 searches/month), Paid from $49/month
- **Signup**: https://hunter.io/users/sign_up
- **Get API Key**: https://hunter.io/api_keys
- **Docs**: https://hunter.io/api-documentation/v2
- **Usage**: Add to `.env.local`:
  ```
  HUNTER_API_KEY=your-key-here
  ```

---

### 10. **Apollo.io** (B2B Contact Data - NEW)
- **Purpose**: Find business contacts, email addresses, phone numbers
- **Cost**: FREE tier (unlimited searches, 10 email credits/month), Paid from $39/month
- **Signup**: https://app.apollo.io/#/signup
- **Get API Key**: https://app.apollo.io/#/settings/integrations/api
  1. Go to Settings → Integrations → API
  2. Click "Create API Key"
  3. Copy key → `APOLLO_API_KEY`
- **Docs**: https://apolloio.github.io/apollo-api-docs/
- **Usage**: Add to `.env.local`:
  ```
  APOLLO_API_KEY=your-key-here
  ```

---

### 11. **Puppeteer** (Web Scraping - NEW)
- **Purpose**: Scrape websites directly for business data
- **Cost**: FREE (self-hosted), OR use Browserless.io ($75/month for hosted)
- **Self-Hosted**: Already included in code (no API key needed)
- **Browserless** (recommended for production):
  - Signup: https://www.browserless.io/sign-up
  - Get Token: https://cloud.browserless.io/account
  - Copy token → `BROWSERLESS_TOKEN`
- **Docs**: https://pptr.dev/

---

## 📊 COST SUMMARY

### Minimum Setup (Just Get Started):
| Service | Cost | Required? |
|---------|------|-----------|
| Supabase | FREE | ✅ Yes |
| OpenAI | ~$5-10/month | ✅ Yes |
| Google Maps | FREE ($200 credit) | ✅ Yes |
| Yelp | FREE | ✅ Yes |
| Mapbox | FREE | ✅ Yes |
| GoHighLevel | Your plan | ✅ Yes |
| **TOTAL** | **~$5-10/month** | |

### Premium Setup (All Features):
| Service | Cost | Required? |
|---------|------|-----------|
| Above services | $5-10/month | ✅ Yes |
| Hunter.io | $49/month | ⚠️ Optional |
| Apollo.io | $39/month | ⚠️ Optional |
| Clearbit | $99/month | ⚠️ Optional |
| BuiltWith | $295/month | ⚠️ Optional |
| Browserless | $75/month | ⚠️ Optional |
| **TOTAL** | **$562-572/month** | |

**Recommendation**: Start with minimum setup ($5-10/month), add optional services as you scale.

---

## 🚀 QUICK SETUP CHECKLIST

```bash
# 1. Clone and install
cd leadly-ai
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Get API keys (in order):
# ✅ Supabase (3 keys)
# ✅ OpenAI (1 key)
# ✅ Google Maps (1 key)
# ✅ Yelp (1 key)
# ✅ Mapbox (1 key)
# ✅ GoHighLevel (1 key)

# 4. Optional enhancements:
# ⚠️ Hunter.io (1 key)
# ⚠️ Apollo.io (1 key)
# ⚠️ Clearbit (1 key)
# ⚠️ BuiltWith (1 key)

# 5. Run Supabase migrations
# Go to Supabase SQL Editor
# Run supabase/migrations/001_initial_schema.sql
# Run supabase/migrations/002_seed_team_avail.sql

# 6. Start app
npm run dev
```

---

## 🔐 SECURITY BEST PRACTICES

1. **Never commit `.env.local`** to version control
2. **Restrict Google Maps API key** to your domain
3. **Keep `SUPABASE_SERVICE_KEY` secret** (server-side only)
4. **Rotate API keys** every 90 days
5. **Use environment variables** in Vercel/production
6. **Enable billing alerts** on all paid services

---

## 🆘 TROUBLESHOOTING

### "API key invalid"
- Double-check you copied the entire key (no extra spaces)
- Verify billing is enabled (OpenAI, Google Maps)
- Check API quotas haven't been exceeded

### "Supabase connection failed"
- Verify Project URL is correct (starts with `https://`)
- Check anon key is the **public** key, not service key
- Ensure Supabase project is active (not paused)

### "No leads returned"
- Verify Google Maps & Yelp keys are set
- Check you enabled Places API in Google Cloud Console
- Try a different city/industry combination

### "OpenAI rate limit"
- You've exceeded free tier or monthly spend limit
- Add billing: https://platform.openai.com/account/billing/overview
- Wait for rate limit to reset (typically 1 minute)

---

## 📞 SUPPORT LINKS

- **Supabase**: https://supabase.com/docs or Discord: https://discord.supabase.com
- **OpenAI**: https://help.openai.com
- **Google Maps**: https://developers.google.com/maps/support
- **Yelp**: https://www.yelp.com/developers/support
- **Mapbox**: https://support.mapbox.com

---

**You now have EVERY link needed to make Leadly.AI fully operational! 🚀**
