# Railway Deployment Guide

## Why Railway?

✅ **Native WebSocket Support** - No workarounds needed
✅ **No Timeouts** - Long-running calls work perfectly
✅ **Persistent Connections** - Maintains state across requests
✅ **Easy Deployment** - Git push to deploy
✅ **Cost Effective** - ~$5-20/month

## Quick Setup (5 minutes)

### 1. Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Or via npm
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

This will open a browser for authentication.

### 3. Initialize Railway Project

```bash
cd /Users/johncox/Desktop/LEADLY.\ AI\ CONCEPT/leadly-ai
railway init
```

Select "Create new project" and give it a name like `leadly-ai`.

### 4. Add PostgreSQL Database

```bash
railway add --database postgres
```

This automatically provisions a Postgres database and adds the connection string to your environment.

### 5. Set Environment Variables

```bash
# Required for Twilio
railway variables set TWILIO_ACCOUNT_SID=your_twilio_account_sid
railway variables set TWILIO_AUTH_TOKEN=your_twilio_auth_token
railway variables set TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Required for Deepgram (for dual-side transcription)
railway variables set DEEPGRAM_API_KEY=your_deepgram_api_key

# Required for Claude AI
railway variables set ANTHROPIC_API_KEY=your_anthropic_api_key

# Required for AssemblyAI
railway variables set ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Required for Google Places API
railway variables set GOOGLE_PLACES_API_KEY=your_google_api_key

# Optional: Set public URL
railway variables set NEXT_PUBLIC_APP_URL=https://your-railway-domain.railway.app
```

### 6. Deploy to Railway

```bash
railway up
```

That's it! Railway will:
- Build your Next.js app
- Deploy to production
- Provide a public HTTPS URL
- Enable WebSocket support automatically

### 7. Get Your Railway URL

```bash
railway domain
```

Copy this URL - you'll need it for Twilio webhook configuration.

## Configure Twilio Webhooks

Once deployed, update your Twilio phone number configuration:

1. Go to Twilio Console → Phone Numbers
2. Select your phone number
3. Update **Voice Configuration**:
   - **A CALL COMES IN**: `https://your-railway-domain.railway.app/api/calls/twiml`
   - **METHOD**: POST
4. Update **Status Callback**:
   - **URL**: `https://your-railway-domain.railway.app/api/calls/status`
   - **METHOD**: POST

## Environment Variables Checklist

Make sure all these are set in Railway:

```bash
# Check current variables
railway variables
```

Required variables:
- ✅ POSTGRES_URL (auto-added by Railway)
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_PHONE_NUMBER
- ✅ DEEPGRAM_API_KEY (for real-time transcription)
- ✅ ANTHROPIC_API_KEY (for AI coaching)
- ✅ ASSEMBLYAI_API_KEY (backup transcription)
- ✅ GOOGLE_PLACES_API_KEY (for lead enrichment)
- ✅ NEXT_PUBLIC_APP_URL (your Railway domain)

## Database Setup

Run migrations to create tables:

```bash
# Connect to Railway database
railway run bash

# Then run migrations (once we create them)
npm run migrate
```

## Monitoring & Logs

View real-time logs:

```bash
railway logs
```

View logs for a specific service:

```bash
railway logs --service web
```

## Cost Estimation

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month
  - Includes $5 credit
  - Pay-as-you-go after
  - ~$0.000463/GB-hour for compute
  - ~$0.25/GB for database storage

Expected monthly cost:
- **Light usage** (< 1000 calls/month): $5-10
- **Medium usage** (1000-10000 calls/month): $10-20
- **Heavy usage** (10000+ calls/month): $20-50

## Advantages Over Vercel

| Feature | Vercel | Railway |
|---------|--------|---------|
| WebSockets | ❌ Limited | ✅ Full Support |
| Long-running processes | ❌ 10s limit | ✅ Unlimited |
| Persistent connections | ❌ No | ✅ Yes |
| Real-time transcription | ⚠️ Workarounds | ✅ Native |
| Cost for this app | ~$20/month | ~$10/month |
| Cold starts | Common | Rare |

## Deployment Commands

```bash
# Deploy
railway up

# View status
railway status

# Open in browser
railway open

# View logs
railway logs

# SSH into container
railway run bash

# Redeploy
railway up --detach
```

## Troubleshooting

### Build fails
```bash
# Check build logs
railway logs --deployment latest

# Force rebuild
railway up --force
```

### Environment variables not working
```bash
# List all variables
railway variables

# Update a variable
railway variables set KEY=value
```

### Database connection issues
```bash
# Get database URL
railway variables | grep POSTGRES_URL

# Connect to database
railway run psql
```

## Next Steps

1. ✅ Deploy to Railway
2. ⏳ Test call transcription with (626) 394-7645
3. ⏳ Verify both sides are being transcribed
4. ⏳ Check Deepgram logs for transcription quality
5. ⏳ Set up database migrations
6. ⏳ Configure production monitoring

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Deepgram Docs: https://developers.deepgram.com
