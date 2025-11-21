# 🚀 AVAIL Production Deployment Guide

**Version**: 1.0
**Last Updated**: January 20, 2025
**Status**: Production Ready

---

## 📋 Pre-Deployment Checklist

### Required API Keys

Before deploying, ensure you have all required API keys:

- ✅ **POSTGRES_URL** - Neon database connection string
- ✅ **TWILIO_ACCOUNT_SID** - Twilio account identifier
- ✅ **TWILIO_AUTH_TOKEN** - Twilio authentication token
- ✅ **TWILIO_PHONE_NUMBER** - Your Twilio phone number (format: +1XXXXXXXXXX)
- ✅ **ANTHROPIC_API_KEY** - Claude AI API key
- ✅ **BUSINESS_PHONE_NUMBER** - Display phone number for website
- ⏳ **POSTMARK_API_KEY** - Email service (optional but recommended)
- ⏳ **GOOGLE_CLIENT_ID** - Google Calendar OAuth (optional)
- ⏳ **GOOGLE_CLIENT_SECRET** - Google Calendar OAuth (optional)
- ⏳ **REDIS_URL** - Job queue service (optional)

### System Requirements

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Vercel CLI (for deployment)

---

## 🏗️ Step 1: Local Testing

### 1.1 Install Dependencies

```bash
cd /path/to/leadly-ai
npm install
```

### 1.2 Configure Environment Variables

Create or verify `.env.local`:

```bash
# Database
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# Business Info
BUSINESS_PHONE_NUMBER=+1 (XXX) XXX-XXXX
DEFAULT_TEAM_ID=your-team-id-here

# Email (Optional)
POSTMARK_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Feature Flags
SHOW_REAL_RESULTS=false

# Redis (Optional)
REDIS_URL=redis://default:password@host:port
```

### 1.3 Run Local Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to verify the application loads.

### 1.4 Run QA Tests

```bash
# Run comprehensive QA test suite
npx tsx bin/qa-test.ts --verbose

# Expected output: 100% pass rate
```

### 1.5 Test Database Connection

```bash
# Test CRM APIs
curl http://localhost:3000/api/contacts?businessId=test

# Should return: {"success":true,"contacts":[]}
```

---

## 📦 Step 2: Vercel Deployment

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Link Project

```bash
vercel link
```

Follow the prompts to:
- Select your Vercel account
- Link to existing project or create new
- Confirm project settings

### 2.4 Add Environment Variables

```bash
# Add all required environment variables to Vercel
vercel env add POSTGRES_URL production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production
vercel env add ANTHROPIC_API_KEY production
vercel env add BUSINESS_PHONE_NUMBER production
vercel env add DEFAULT_TEAM_ID production

# Optional variables
vercel env add POSTMARK_API_KEY production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add REDIS_URL production
vercel env add SHOW_REAL_RESULTS production
```

**Alternative**: Add via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add each variable with "Production" scope

### 2.5 Deploy to Production

```bash
# Deploy with production build
vercel --prod

# Or use npm script
npm run build
vercel --prod --yes
```

Wait for deployment to complete. Vercel will provide a production URL:
```
✅ Production: https://your-app.vercel.app
```

---

## 🔌 Step 3: Configure Twilio Webhooks

After deployment, configure Twilio to send webhooks to your production URL.

### 3.1 Login to Twilio Console

Visit: https://console.twilio.com/

### 3.2 Configure SMS Webhook

1. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on your Twilio phone number
3. Scroll to **Messaging Configuration**
4. Set **A MESSAGE COMES IN** webhook:
   ```
   https://your-app.vercel.app/api/webhooks/twilio/sms
   ```
5. Method: `HTTP POST`
6. Click **Save**

### 3.3 Configure Voice Webhook

1. Same phone number settings page
2. Scroll to **Voice Configuration**
3. Set **A CALL COMES IN** webhook:
   ```
   https://your-app.vercel.app/api/webhooks/twilio/voice
   ```
4. Method: `HTTP POST`
5. Click **Save**

### 3.4 Test Webhooks

Send a test SMS to your Twilio number:
```
Send "test" to your Twilio number
```

Check Vercel logs to verify webhook received:
```bash
vercel logs --prod
```

You should see:
```
📨 Incoming SMS webhook: { from: '+1...', body: 'test' }
✅ Inbound SMS logged to database
```

---

## ✅ Step 4: Post-Deployment Verification

### 4.1 Test Critical Flows

**Test 1: Homepage Loads**
```bash
curl -I https://your-app.vercel.app/
# Expected: HTTP/2 200
```

**Test 2: Intake Form Works**
1. Visit `https://your-app.vercel.app/intake`
2. Fill out form completely
3. Submit
4. Verify confirmation page appears
5. Check database for new Business/Contact/Deal records

**Test 3: CRM API Responds**
```bash
curl https://your-app.vercel.app/api/contacts?businessId=test
# Expected: {"success":true,"contacts":[]}
```

**Test 4: Twilio SMS Webhook**
1. Send SMS to your Twilio number
2. Check Vercel logs for webhook receipt
3. If automation rules exist, verify auto-reply sent

**Test 5: Booking Form (Demo Website)**
1. Visit `https://your-app.vercel.app/demos-live/website`
2. Click "Book Service"
3. Complete 3-step booking flow
4. Verify confirmation appears
5. Check CRM for new booking record

### 4.2 Monitor Logs

```bash
# Follow production logs in real-time
vercel logs --prod --follow

# Search for errors
vercel logs --prod | grep ERROR

# Check webhook activity
vercel logs --prod | grep webhook
```

### 4.3 Database Verification

```bash
# Connect to Neon database
psql $POSTGRES_URL

# Check tables exist
\dt

# Verify sample data
SELECT COUNT(*) FROM businesses;
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM deals;
```

---

## 🔒 Step 5: Security & Performance

### 5.1 Security Checklist

- [x] Twilio webhook signature validation enabled
- [x] Environment variables not exposed to client
- [x] HTTPS enforced (Vercel default)
- [x] Database connection uses SSL
- [x] API routes validate input
- [x] No sensitive data in logs
- [x] CORS configured properly

### 5.2 Performance Optimization

**Vercel Configuration** (already optimized):
- ✅ Edge runtime for webhooks (lowest latency)
- ✅ Static page generation where possible
- ✅ Image optimization enabled
- ✅ CDN caching configured

**Database Optimization**:
- ✅ Neon connection pooling enabled
- ✅ Indexes on frequently queried fields
- ✅ SQLite fallback for development

### 5.3 Monitoring Setup

**Recommended Tools**:
1. **Vercel Analytics** (built-in)
   - Page view tracking
   - Performance metrics
   - Error monitoring

2. **Sentry** (optional)
   ```bash
   npm install @sentry/nextjs
   # Configure in next.config.js
   ```

3. **Uptime Monitoring** (optional)
   - UptimeRobot: https://uptimerobot.com/
   - Ping every 5 minutes
   - Alert if down > 2 minutes

---

## 📊 Step 6: Create Demo Accounts

### 6.1 Provision Burner Demos

```bash
# Create demo account for a real business
npx tsx bin/provision-demo.ts \
  --url https://example-plumbing.com \
  --name "Example Plumbing" \
  --industry "Plumbing" \
  --city "Los Angeles" \
  --state "CA"
```

This will:
- Scrape company branding
- Create Business record
- Generate 5 sample contacts
- Create deals in various stages
- Schedule 3 demo appointments
- Set up automation rules
- Output access URLs

### 6.2 Share Demo Links

After provisioning, share these URLs with prospects:

```
CRM Demo:
https://your-app.vercel.app/demos-live/crm?businessId=xxxx-xxxx

Website Demo:
https://your-app.vercel.app/demos-live/website?businessId=xxxx-xxxx
```

### 6.3 Demo Expiry

Demo accounts auto-expire after 14 days. To clean up:

```bash
# Manual cleanup (future enhancement)
# Run nightly cron to delete expired demos
# See: docs/DEMO_EXPIRY_SETUP.md
```

---

## 🐛 Troubleshooting

### Issue: Twilio Webhooks Not Working

**Symptoms**: SMS received but no database log, no auto-reply

**Solutions**:
1. Check webhook URL is correct (no trailing slash)
2. Verify Twilio signature validation:
   ```bash
   vercel logs --prod | grep "Invalid Twilio signature"
   ```
3. Ensure `TWILIO_AUTH_TOKEN` matches console
4. Test webhook manually:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhooks/twilio/sms \
     -d "From=+15551234567&To=+15559876543&Body=test"
   ```

### Issue: Database Connection Fails

**Symptoms**: API routes return 500 errors

**Solutions**:
1. Verify `POSTGRES_URL` is correct:
   ```bash
   psql $POSTGRES_URL -c "SELECT 1"
   ```
2. Check Neon dashboard for connection limits
3. Ensure SSL mode is included in connection string:
   ```
   ?sslmode=require
   ```

### Issue: Build Fails on Vercel

**Symptoms**: Deployment fails during build step

**Solutions**:
1. Check build logs:
   ```bash
   vercel logs --prod
   ```
2. Verify TypeScript compilation locally:
   ```bash
   npx tsc --noEmit
   ```
3. Check for missing dependencies:
   ```bash
   npm install
   ```

### Issue: Intake Form Doesn't Create Records

**Symptoms**: Form submits but no data in database

**Solutions**:
1. Check Vercel function logs:
   ```bash
   vercel logs --prod | grep "intake"
   ```
2. Verify `DEFAULT_TEAM_ID` is set:
   ```bash
   vercel env ls | grep DEFAULT_TEAM_ID
   ```
3. Test API directly:
   ```bash
   curl -X POST https://your-app.vercel.app/api/crm/intake \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
   ```

---

## 📚 Additional Resources

### Documentation
- [ZACHS_DOC_PLAN.md](./ZACHS_DOC_PLAN.md) - Complete implementation status
- [SESSION_3_SUMMARY.md](./SESSION_3_SUMMARY.md) - Automations & Twilio
- [SESSION_4_SUMMARY.md](./SESSION_4_SUMMARY.md) - Demo pages verification
- [API_KEYS_CHECKLIST.md](./API_KEYS_CHECKLIST.md) - Required credentials

### External Services
- **Vercel Docs**: https://vercel.com/docs
- **Twilio Webhooks**: https://www.twilio.com/docs/usage/webhooks
- **Neon Database**: https://neon.tech/docs
- **Postmark Email**: https://postmarkapp.com/developer
- **Google Calendar API**: https://developers.google.com/calendar

### Support Contacts
- **Vercel Support**: https://vercel.com/support
- **Twilio Support**: https://www.twilio.com/help/contact
- **Neon Support**: https://neon.tech/docs/introduction/support

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ All pages load without errors
- ✅ Intake form creates CRM records
- ✅ Twilio webhooks receive and process SMS
- ✅ Voice IVR menu responds to calls
- ✅ Automation rules trigger correctly
- ✅ Demo accounts can be provisioned
- ✅ QA test suite passes 100%
- ✅ No errors in Vercel logs for 24 hours

---

## 🔄 Maintenance & Updates

### Regular Tasks

**Weekly**:
- Review Vercel logs for errors
- Check Twilio usage/costs
- Verify automation rules working
- Monitor database size

**Monthly**:
- Update dependencies:
  ```bash
  npm update
  npm audit fix
  ```
- Review demo account expiry
- Analyze performance metrics
- Check for security updates

**Quarterly**:
- Review and optimize database queries
- Update API documentation
- Audit automation rules effectiveness
- Consider new feature requests

### Deployment Updates

To deploy code changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main

# Vercel auto-deploys from main branch
# Or manual deploy:
vercel --prod
```

---

## 📞 Emergency Contacts

**Critical Issues (Production Down)**:
1. Check Vercel status: https://www.vercel-status.com/
2. Check Twilio status: https://status.twilio.com/
3. Check Neon status: https://neonstatus.com/

**Rollback Procedure**:
```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

**🎉 Congratulations! Your AVAIL platform is now live in production!**

For questions or issues, refer to the documentation files or contact the development team.
