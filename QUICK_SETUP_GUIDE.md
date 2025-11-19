# 🚀 QUICK SETUP GUIDE

Your Supabase URL: **https://czvgerhpxwffcbvdwcaz.supabase.co**

---

## ✅ REQUIRED API KEYS (Do these in order)

### 1. SUPABASE (Database) - FREE
**Get your keys:**
- Direct link: https://supabase.com/dashboard/project/czvgerhpxwffcbvdwcaz/settings/api
- Copy **3 keys** and add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://czvgerhpxwffcbvdwcaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (copy "anon public" key)
SUPABASE_SERVICE_KEY=eyJhbGci... (copy "service_role" key)
```

**Run migrations:**
1. Go to: https://supabase.com/dashboard/project/czvgerhpxwffcbvdwcaz/editor
2. Click "SQL Editor" → "New query"
3. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Repeat for `002_seed_team_avail.sql`

---

### 2. OPENAI (AI Scoring) - $5-10/month
**Sign up:** https://platform.openai.com/signup
**Get key:** https://platform.openai.com/api-keys
**Cost:** ~$0.01 per 100 leads scored

```bash
OPENAI_API_KEY=sk-proj-xxxxx
```

---

### 3. GOOGLE MAPS (Lead Scraping) - FREE
**Sign up:** https://console.cloud.google.com
**Get key:** https://console.cloud.google.com/apis/credentials

**Steps:**
1. Create a project
2. Enable billing (gets $200 free credit)
3. Enable these APIs:
   - Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
4. Create credentials → API key

```bash
GOOGLE_MAPS_API_KEY=AIzaxxxxx
```

---

### 4. YELP (Lead Scraping) - FREE
**Sign up:** https://www.yelp.com/developers/v3/manage_app
**Create app** and copy API key

```bash
YELP_API_KEY=your-yelp-key
```

---

### 5. MAPBOX (Heatmap Visualization) - FREE
**Sign up:** https://account.mapbox.com/auth/signup/
**Get token:** https://account.mapbox.com/access-tokens/

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1xxxxx
```

---

## ⚡ YOUR .ENV.LOCAL TEMPLATE

Copy this to your `.env.local` and fill in your keys:

```bash
# =============================================================================
# LEADLY.AI - MINIMUM REQUIRED KEYS
# =============================================================================

# 1. DATABASE (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://czvgerhpxwffcbvdwcaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# 2. AI SERVICES (OpenAI)
OPENAI_API_KEY=

# 3. LEAD DISCOVERY (Google Maps + Yelp)
GOOGLE_MAPS_API_KEY=
YELP_API_KEY=

# 4. MAPS VISUALIZATION (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 🎯 AFTER YOU ADD THE KEYS

1. **Save** `.env.local`
2. **Restart the server** (I'll do this for you)
3. **Visit** http://localhost:3000/dashboard
4. **You should see:** Team Avail data with sample leads!

---

## 📊 TESTING CHECKLIST

Once keys are added:
- [ ] Dashboard shows "Team Avail" instead of "Loading..."
- [ ] See 1 sample lead (Elite Dental Care)
- [ ] Can search for new leads via chat
- [ ] AI scoring works
- [ ] Heatmap displays on analytics page

---

## 🆘 TROUBLESHOOTING

**"Missing NEXT_PUBLIC_SUPABASE_URL"**
→ Make sure keys start with `NEXT_PUBLIC_` for browser access

**"No leads showing"**
→ Run the SQL migrations in Supabase SQL Editor

**"API key invalid"**
→ Check that you copied the full key (no spaces, no line breaks)

**"Build errors"**
→ Restart the dev server after adding keys

---

## 📞 NEED HELP?

All the API signup links are in: `API_SERVICES.md`

**Tell me when you've added the keys and I'll restart the server for you!** 🚀
