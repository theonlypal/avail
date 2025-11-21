# API Keys Checklist for End-to-End Testing

## ✅ Already Configured & Working

These keys are already set and working in your local environment:

```bash
# Database (Neon Postgres)
POSTGRES_URL=postgresql://neondb_owner:npg_lgY2jk5QbRUP@ep-autumn-lab-adw06pfn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Twilio SMS + Voice + IVR
TWILIO_ACCOUNT_SID=AC99a7017187256d82a02b4b837f3fea81
TWILIO_AUTH_TOKEN=fd1b4fc2b6cbc5bb89a6e0d32703f6fb
TWILIO_PHONE_NUMBER=+12132052620

# AI (Claude Sonnet 4.5)
ANTHROPIC_API_KEY=sk-ant-api03-FV5uUfxQo0TfLPqKV5g4-g68gJ5lB8Muz8Nq1wNzEcIvqYN3K4rSDHCrTEe4f9_QCTTY_KGx29Lk4nWzKhIMdQ-WYDMkgAA

# Google Places (Lead Discovery)
GOOGLE_PLACES_API_KEY=AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY

# Business Contact Info
BUSINESS_PHONE_NUMBER=+1 (213) 555-0120
```

---

## 🔴 Missing Keys - Add These for Full Testing

### Priority 1: Email Confirmations (REQUIRED)

**Service:** Postmark
**Why:** Sends confirmation emails from intake form and appointment reminders
**Sign Up:** https://postmarkapp.com/

```bash
POSTMARK_API_KEY=YOUR_KEY_HERE
```

**Quick Setup:**
1. Create free Postmark account
2. Verify your domain OR use their sandbox mode for testing
3. Get API key from Settings → API Tokens
4. Add to `.env.local`

**Test It:**
```bash
# Submit intake form at /intake
# Check email inbox for confirmation
```

---

### Priority 2: Google Calendar (REQUIRED for appointments)

**Service:** Google Cloud Platform
**Why:** Creates calendar events when appointments are booked
**Sign Up:** https://console.cloud.google.com/

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

**Quick Setup:**
1. Go to Google Cloud Console
2. Create new project (or use existing)
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret
6. Add to `.env.local`

**Test It:**
```bash
# POST to /api/appointments with contact_id, start_time, end_time
# Check your Google Calendar for new event
```

---

### Priority 3: Google Programmable Search (OPTIONAL)

**Service:** Google Programmable Search Engine
**Why:** Powers Leadly AI lead discovery (already partially working with Places API)
**Sign Up:** https://programmablesearchengine.google.com/

```bash
GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID
GOOGLE_SEARCH_API_KEY=YOUR_API_KEY
```

**Quick Setup:**
1. Create new search engine at programmablesearchengine.google.com
2. Enable "Search the entire web"
3. Get Search Engine ID from control panel
4. Get API key from Google Cloud Console → Credentials
5. Add to `.env.local`

**Test It:**
```bash
# Use Leadly AI at /leads or /ai/search
# Search should return business results
```

---

### Priority 4: Redis Job Queue (OPTIONAL)

**Service:** Upstash Redis
**Why:** Background job processing, automation rules, scheduled tasks
**Sign Up:** https://upstash.com/

```bash
REDIS_URL=YOUR_UPSTASH_REDIS_URL
```

**Quick Setup:**
1. Create free Upstash account
2. Create new Redis database
3. Copy the Redis URL (format: `redis://...`)
4. Add to `.env.local`

**Note:** Not required for basic testing. Only needed for:
- Automation rules (auto-replies, follow-ups)
- Scheduled jobs (daily reports, cleanup tasks)
- Background processing (bulk operations)

---

## 📝 Complete .env.local Template

Copy this to your `.env.local` file and fill in missing keys:

```bash
# ============================================
# DATABASE
# ============================================
POSTGRES_URL=postgresql://neondb_owner:npg_lgY2jk5QbRUP@ep-autumn-lab-adw06pfn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# ============================================
# TWILIO (SMS + VOICE + IVR)
# ============================================
TWILIO_ACCOUNT_SID=AC99a7017187256d82a02b4b837f3fea81
TWILIO_AUTH_TOKEN=fd1b4fc2b6cbc5bb89a6e0d32703f6fb
TWILIO_PHONE_NUMBER=+12132052620

# ============================================
# EMAIL (POSTMARK)
# ============================================
POSTMARK_API_KEY=

# ============================================
# GOOGLE CALENDAR
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ============================================
# GOOGLE SEARCH (LEADLY AI)
# ============================================
GOOGLE_PLACES_API_KEY=AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY
GOOGLE_SEARCH_ENGINE_ID=
GOOGLE_SEARCH_API_KEY=

# ============================================
# AI (CLAUDE)
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-FV5uUfxQo0TfLPqKV5g4-g68gJ5lB8Muz8Nq1wNzEcIvqYN3K4rSDHCrTEe4f9_QCTTY_KGx29Lk4nWzKhIMdQ-WYDMkgAA

# ============================================
# REDIS (OPTIONAL - FOR AUTOMATIONS)
# ============================================
REDIS_URL=

# ============================================
# BUSINESS INFO
# ============================================
BUSINESS_PHONE_NUMBER=+1 (213) 555-0120
SHOW_REAL_RESULTS=false
```

---

## 🧪 Testing Checklist

Once you've added the missing API keys, run through these tests:

### Test 1: Intake Form End-to-End
- [ ] Visit `/intake`
- [ ] Fill out complete form
- [ ] Submit form
- [ ] Verify SMS received (Twilio)
- [ ] Verify email received (Postmark)
- [ ] Check database: Business, Contact, Deal created
- [ ] Check database: Messages logged

### Test 2: Twilio SMS Webhook
- [ ] Configure webhook in Twilio Console
- [ ] Send SMS to your Twilio number
- [ ] Check console logs for "Incoming SMS webhook"
- [ ] Query `/api/messages/sms?contactId=null` to see unlinked messages
- [ ] Verify signature validation working

### Test 3: Twilio Voice/IVR
- [ ] Configure voice webhook in Twilio Console
- [ ] Call your Twilio number
- [ ] Test all menu options (1, 2, 3)
- [ ] Leave a voicemail
- [ ] Check database for call logs
- [ ] Verify voicemail transcription received

### Test 4: Appointment + Google Calendar
- [ ] Create contact via `/api/contacts`
- [ ] Create appointment via `/api/appointments`
- [ ] Check Google Calendar for event
- [ ] Update appointment status
- [ ] Verify Google Calendar syncs

### Test 5: Leadly AI Search
- [ ] Visit `/leads` or use `/api/ai/search`
- [ ] Search for "restaurants in San Francisco"
- [ ] Verify results returned
- [ ] Check enrichment data

---

## 🚨 Troubleshooting

**Email not sending?**
- Check POSTMARK_API_KEY is set correctly
- Verify sender domain or use sandbox mode
- Check Postmark dashboard for delivery logs

**Calendar not working?**
- Ensure Google Calendar API is enabled
- Check OAuth redirect URL matches exactly
- Test OAuth flow: Visit `/api/auth/signin`

**Twilio webhooks not receiving?**
- Use ngrok to expose localhost: `ngrok http 3000`
- Update Twilio webhooks to ngrok URL
- Check Twilio webhook logs for errors

**Redis connection failing?**
- Verify REDIS_URL format is correct
- Check Upstash dashboard for connection limits
- Most features work without Redis

---

## 📞 Support

If you encounter issues with API setup:
1. Check console logs for specific error messages
2. Verify API keys don't have extra spaces/quotes
3. Restart dev server after adding keys: `npm run dev`
4. Check service status pages (status.postmarkapp.com, status.twilio.com, etc.)
