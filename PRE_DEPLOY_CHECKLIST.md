# ✅ Pre-Deploy Checklist for Railway

## Before You Deploy

Run through this checklist to ensure everything is ready:

### 1. GitHub Repository
- ✅ **Repository created**: https://github.com/bydc-cloud/AVAIL.git
- ⏳ **Code pushed to main branch** (push your latest code)

### 2. Environment Variables Ready
All variables are documented in [DEPLOY_NOW.md](DEPLOY_NOW.md) and ready to copy/paste:

- ✅ `DEEPGRAM_API_KEY` - 10cadc2e6f5b24b1a512b2e137ecbf6bad69efba
- ✅ `TWILIO_ACCOUNT_SID` - AC99a7017187256d82a02b4b837f3fea81
- ✅ `TWILIO_AUTH_TOKEN` - fd1b4fc2b6cbc5bb89a6e0d32703f6fb
- ✅ `TWILIO_PHONE_NUMBER` - +12132052620
- ✅ `ANTHROPIC_API_KEY` - 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
- ✅ `ASSEMBLYAI_API_KEY` - 95901a2b922b4cbda64514701b095b66
- ✅ `GOOGLE_PLACES_API_KEY` - AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY
- ✅ `SERPER_API_KEY` - 3cb1aef55d0993bb11765e80e9f483e64f672de8
- ⏳ `NEXT_PUBLIC_APP_URL` - (add after Railway generates your domain)

### 3. Railway Configuration Files
- ✅ `railway.json` - Created
- ✅ `nixpacks.toml` - Created
- ✅ `package.json` - Has correct scripts (`build`, `start`)

### 4. Key Files Implemented
- ✅ `/api/calls/twiml/route.ts` - TwiML with Media Streams
- ✅ `/api/calls/stream/route.ts` - Deepgram WebSocket handler
- ✅ `/api/calls/status/route.ts` - Call status updates
- ✅ `/api/calls/initiate/route.ts` - Dual DB support

### 5. Dependencies Installed
- ✅ `@deepgram/sdk` - v4.11.2
- ✅ `twilio` - v5.10.5
- ✅ `@neondatabase/serverless` - v1.0.2

---

## Deployment Steps (from DEPLOY_NOW.md)

### Quick Path (10 minutes):

1. **Push code to GitHub** (if not done yet):
   ```bash
   cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
   git init
   git add .
   git commit -m "Initial commit - AVAIL with dual-side transcription"
   git remote add origin https://github.com/bydc-cloud/AVAIL.git
   git push -u origin main
   ```

2. **Go to Railway**: https://railway.app
   - Login with GitHub
   - Create new project
   - Select `bydc-cloud/AVAIL`

3. **Add PostgreSQL**:
   - Click "+ New" → "Database" → "PostgreSQL"

4. **Add Environment Variables**:
   - Copy/paste from [DEPLOY_NOW.md](DEPLOY_NOW.md) Step 4

5. **Generate Domain**:
   - Settings → Networking → "Generate Domain"
   - Copy the URL

6. **Add App URL Variable**:
   - `NEXT_PUBLIC_APP_URL=https://your-railway-domain.railway.app`

7. **Configure Twilio Webhooks**:
   - Point to Railway URL (not Vercel)

8. **Test**:
   - Go to `/test-dialer`
   - Call (626) 394-7645
   - Verify dual-side transcription

---

## What Happens During Deployment

Railway will automatically:
1. ✅ Detect Next.js project
2. ✅ Run `npm install`
3. ✅ Run `npm run build`
4. ✅ Start with `npm start`
5. ✅ Enable WebSocket support
6. ✅ Provision PostgreSQL database
7. ✅ Generate HTTPS domain
8. ✅ Set up SSL certificates

---

## Expected Timeline

| Step | Duration |
|------|----------|
| Push code to GitHub | 1 min |
| Create Railway project | 2 min |
| Add PostgreSQL | 30 sec |
| Add environment variables | 5 min |
| Generate domain | 1 min |
| Add App URL variable | 30 sec |
| Configure Twilio webhooks | 2 min |
| Test transcription | 2 min |
| **TOTAL** | **~12 minutes** |

---

## Post-Deployment Verification

After deploying, verify these work:

- [ ] App loads at Railway URL
- [ ] `/test-dialer` page renders
- [ ] Can initiate a call
- [ ] Phone rings at test number
- [ ] Recipient answers without error
- [ ] Both sides are transcribed in real-time
- [ ] Speaker labels show "Agent" and "Lead"
- [ ] No errors in Railway logs

---

## Cost Estimate

### Railway
- **Base**: $5/month (includes credit)
- **Usage**: ~$0.000463/GB-hour
- **Expected**: $10-15/month for 500 calls

### Deepgram
- **Free tier**: 45,000 minutes/month
- **For 500 calls @ 5min avg**: $0 (within free tier)

### Total
**~$10-12/month for 500 calls**

---

## Support Resources

- **Railway Discord**: https://discord.gg/railway
- **Deepgram Docs**: https://developers.deepgram.com
- **Twilio Media Streams**: https://www.twilio.com/docs/voice/media-streams

---

## Ready to Deploy?

Open [DEPLOY_NOW.md](DEPLOY_NOW.md) and follow the step-by-step guide!

**Estimated completion time: 10-12 minutes** ⚡
