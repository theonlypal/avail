# API KEYS REQUIRED FOR PRODUCTION

This document lists all the API keys you need to activate the production features in AVAIL.

## ✅ WHAT'S ALREADY BUILT AND READY

The following features are **fully coded** and will activate immediately when you add the corresponding API keys:

1. **ROI Calculator** - NO API keys needed, works now
2. **Intake Form with CRM** - Creates Business/Contact/Deal records
3. **SMS Confirmations** - Twilio integration ready
4. **Email Confirmations** - Postmark integration ready
5. **Google Calendar Integration** - OAuth flow ready
6. **Review Requests** - Database + API endpoints ready
7. **Automation Rules** - Database + API endpoints ready
8. **Burner Provisioning Script** - Works now (Puppeteer included)

---

## 🔑 API KEYS TO ADD

### 1. TWILIO (SMS & Voice) - **CRITICAL**

**What it enables:**
- SMS confirmations when leads submit intake form
- SMS review requests
- 2-way SMS messaging with contacts
- Voice calling (requires additional Twilio Voice setup - not yet built)

**Required keys:**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Optional
```

**Where to get them:**
1. Sign up at https://www.twilio.com/
2. Go to Console Dashboard
3. Copy Account SID and Auth Token
4. Buy a phone number (Voice + SMS enabled)
5. Copy the phone number

**Cost:** ~$1/month for phone number + $0.0075 per SMS

---

### 2. POSTMARK (Email) - **CRITICAL**

**What it enables:**
- Email confirmations when leads submit intake form
- Beautifully formatted HTML emails with branding
- Email tracking and delivery confirmation

**Required keys:**
```bash
POSTMARK_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
```

**Where to get them:**
1. Sign up at https://postmarkapp.com/
2. Create a Server
3. Go to API Tokens tab
4. Copy Server API Token
5. Verify your sending domain

**Cost:** Free tier includes 100 emails/month, then $15/month for 10k emails

---

### 3. GOOGLE CALENDAR (Scheduling) - **IMPORTANT**

**What it enables:**
- Create calendar events for appointments
- Check availability before booking
- Send calendar invites to customers
- OAuth integration for team calendar access

**Required keys:**
```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback/google  # Or http://localhost:3000/api/auth/callback/google for dev
```

**Where to get them:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable Google Calendar API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) and `https://yourdomain.com/api/auth/callback/google` (prod)
7. Copy Client ID and Client Secret

**Cost:** FREE (Google Calendar API is free)

---

### 4. ANTHROPIC CLAUDE (AI Features) - **NICE TO HAVE**

**What it enables:**
- AI caption generation for social media posts
- AI-powered chat assistance (if you build it)
- Smart content suggestions

**Required key:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
1. Sign up at https://console.anthropic.com/
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-api03-`)

**Cost:** Pay per use, ~$3 per million input tokens for Claude Haiku

---

### 5. GOOGLE PLACES API (Lead Enrichment) - **OPTIONAL**

**What it enables:**
- Enrich business leads with additional data
- Verify business addresses
- Get business hours and ratings

**Required key:**
```bash
GOOGLE_PLACES_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
1. Go to https://console.cloud.google.com/
2. Enable Places API
3. Go to Credentials → Create API Key
4. Restrict key to Places API only

**Cost:** $17 per 1,000 requests (first $200/month free credit)

---

### 6. BUSINESS PHONE NUMBER - **DISPLAY ONLY**

This is not an API key, but a configuration for displaying your business phone number:

```bash
BUSINESS_PHONE_NUMBER=+12135551234
NEXT_PUBLIC_BUSINESS_PHONE_NUMBER=+12135551234
```

Use the same Twilio number or a dedicated business line.

---

## 📋 COMPLETE .env FILE TEMPLATE

Create a `.env.local` file in your project root with all keys:

```bash
# Database (Neon Postgres - REQUIRED FOR PRODUCTION)
POSTGRES_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Twilio (SMS & Voice)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Postmark (Email)
POSTMARK_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Google Calendar
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Anthropic Claude (AI)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Places (Optional)
GOOGLE_PLACES_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Business Configuration
BUSINESS_PHONE_NUMBER=+12135551234
NEXT_PUBLIC_BUSINESS_PHONE_NUMBER=+12135551234

# Feature Flags
SHOW_REAL_RESULTS=false  # Set to true once you have real data
```

---

## 🚀 HOW TO ADD KEYS

### For Local Development:
1. Copy the template above
2. Create `.env.local` in project root
3. Fill in your actual API keys
4. Restart your dev server: `npm run dev`

### For Production (Vercel):
```bash
# Navigate to your project
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"

# Add each key to Vercel production environment
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production
npx vercel env add TWILIO_PHONE_NUMBER production
npx vercel env add POSTMARK_API_KEY production
npx vercel env add POSTMARK_FROM_EMAIL production
npx vercel env add GOOGLE_CLIENT_ID production
npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel env add GOOGLE_REDIRECT_URI production
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add BUSINESS_PHONE_NUMBER production
npx vercel env add POSTGRES_URL production

# Redeploy
npx vercel --prod
```

---

## ✅ TESTING CHECKLIST

Once you add the keys, test each feature:

- [ ] Submit intake form → Check CRM for new Business/Contact/Deal
- [ ] Verify SMS confirmation received on your phone
- [ ] Verify email confirmation in inbox
- [ ] Test review request SMS sending
- [ ] Test Google Calendar event creation (requires OAuth flow)
- [ ] Test AI caption generator for social posts
- [ ] Run burner provisioning script: `npm run provision -- --url https://example.com`

---

## 🆘 TROUBLESHOOTING

**SMS not sending?**
- Check Twilio dashboard for error logs
- Verify phone number format (+1XXXXXXXXXX)
- Check Twilio account balance

**Email not sending?**
- Verify Postmark domain is verified
- Check Postmark activity log
- Ensure FROM email matches verified domain

**Google Calendar not working?**
- Complete OAuth flow in browser
- Check redirect URI matches exactly
- Verify Calendar API is enabled in Google Cloud Console

---

## 💰 ESTIMATED MONTHLY COSTS

Based on moderate usage (100 leads/month):

- **Twilio SMS**: $1 (phone) + $0.75 (100 messages) = **$1.75/month**
- **Postmark Email**: **FREE** (under 100 emails/month)
- **Google Calendar**: **FREE**
- **Anthropic Claude**: **$5-10/month** (depends on usage)
- **Google Places**: **FREE** (within $200/month credit)
- **Neon Postgres**: **FREE** (512MB storage, 0.5 CPU)

**Total: ~$7-12/month** for core features

---

## 🎯 PRIORITY ORDER

Add keys in this order for fastest value:

1. **POSTGRES_URL** - Database (everything needs this)
2. **TWILIO** - SMS confirmations (immediate customer engagement)
3. **POSTMARK** - Email confirmations (professional communication)
4. **GOOGLE_CALENDAR** - Scheduling (reduces manual booking)
5. **ANTHROPIC** - AI features (nice-to-have enhancements)
6. **GOOGLE_PLACES** - Lead enrichment (optional optimization)

---

**ONCE YOU ADD THESE KEYS, THE ENTIRE INTAKE FLOW WILL WORK END-TO-END!**
