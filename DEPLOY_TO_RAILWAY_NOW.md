# Deploy to Railway - Complete Guide

## 🚀 Quick Deploy (10 minutes)

### Step 1: Create Railway Account & Connect GitHub (2 min)

1. Go to https://railway.app
2. Click **"Login"** → **"Sign in with GitHub"**
3. Authorize Railway to access your repositories

### Step 2: Create New Project from GitHub (1 min)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `leadly-ai` (or your repository name)
4. Railway will start building automatically

### Step 3: Add PostgreSQL Database (30 seconds)

1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Done! Railway automatically adds `POSTGRES_URL` to your environment

### Step 4: Add Environment Variables (5 minutes)

Click on your web service → **"Variables"** tab → **"Add Variable"**

Copy and paste these **EXACTLY** as shown:

```
DEEPGRAM_API_KEY=10cadc2e6f5b24b1a512b2e137ecbf6bad69efba
TWILIO_ACCOUNT_SID=AC99a7017187256d82a02b4b837f3fea81
TWILIO_AUTH_TOKEN=fd1b4fc2b6cbc5bb89a6e0d32703f6fb
TWILIO_PHONE_NUMBER=+12132052620
ANTHROPIC_API_KEY=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
ASSEMBLYAI_API_KEY=95901a2b922b4cbda64514701b095b66
GOOGLE_PLACES_API_KEY=AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY
SERPER_API_KEY=3cb1aef55d0993bb11765e80e9f483e64f672de8
```

**IMPORTANT**: After adding all variables, Railway will automatically redeploy.

### Step 5: Get Your Railway URL (1 minute)

1. Click on your web service
2. Go to **"Settings"** tab
3. Scroll down to **"Networking"**
4. Click **"Generate Domain"**
5. Copy your URL (e.g., `leadly-ai-production.railway.app`)

### Step 6: Update Environment Variable (30 seconds)

Go back to **"Variables"** tab and add:

```
NEXT_PUBLIC_APP_URL=https://your-railway-url.railway.app
```

Replace `your-railway-url` with the actual domain you got in Step 5.

### Step 7: Configure Twilio Webhooks (2 minutes)

1. Go to https://console.twilio.com/
2. Click **"Phone Numbers"** → **"Manage"** → **"Active numbers"**
3. Click on your phone number: `+12132052620`
4. Scroll to **"Voice Configuration"**
5. Set:
   - **A CALL COMES IN**: `https://your-railway-url.railway.app/api/calls/twiml`
   - **HTTP**: POST
   - **Status Callback URL**: `https://your-railway-url.railway.app/api/calls/status`
   - **HTTP**: POST
6. Click **"Save"**

### Step 8: Test It! 🎉

1. Go to `https://your-railway-url.railway.app/test-dialer`
2. Enter phone number: `(626) 394-7645`
3. Click **"Start Call with AI Coaching"**
4. Answer the phone when it rings
5. Both sides will be transcribed in real-time with speaker labels!

---

## 📊 What You Get

✅ **Real-time transcription** of BOTH sides of the call (400-650ms latency)
✅ **Speaker diarization** - automatically identifies "Agent" vs "Lead"
✅ **Unlimited call duration** - no 30-second timeout
✅ **WebSocket support** - native, no workarounds
✅ **PostgreSQL database** - auto-provisioned and connected
✅ **HTTPS domain** - automatic SSL certificates
✅ **Auto-scaling** - handles traffic spikes

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Option 1: Web Dashboard
Go to your Railway project → Click on service → "Deployments" tab → Click latest deployment

# Option 2: CLI (if installed)
npx @railway/cli logs
```

### Check Deployment Status

In Railway dashboard:
- Green checkmark = Deployed successfully
- Orange spinner = Building/deploying
- Red X = Build failed (check logs)

### Common Issues

**Build Failed?**
- Check the "Deployments" tab for error logs
- Usually a missing dependency or TypeScript error

**Can't access the app?**
- Make sure you generated a domain in Settings → Networking
- Check that all environment variables are set

**Calls not working?**
- Verify Twilio webhooks are pointing to your Railway URL
- Check that `DEEPGRAM_API_KEY` is set correctly
- View logs for error messages

---

## 💰 Cost Estimate

**Railway Pricing:**
- First $5/month included (covers light usage)
- After: ~$0.000463/GB-hour

**Expected Monthly Cost:**
- **Light usage** (< 100 calls/month): $5-8
- **Medium usage** (100-1000 calls/month): $8-15
- **Heavy usage** (1000+ calls/month): $15-25

**Deepgram Pricing:**
- **Free tier**: 45,000 minutes/month
- After: $0.0043/minute (~$0.26/hour)

**Total estimated cost for 500 calls/month (avg 5 min each):**
- Railway: ~$10
- Deepgram: $0 (within free tier)
- **Total: ~$10/month**

---

## 🎯 What's Next

After deployment, you can:

1. **Test the dual-side transcription** with real calls
2. **View transcripts** in the database
3. **Integrate with your CRM** (the API endpoints are ready)
4. **Scale up** - Railway handles it automatically

---

## 📝 Quick Reference

| What | Value |
|------|-------|
| Railway Dashboard | https://railway.app/project/your-project-id |
| Your App URL | `https://your-railway-url.railway.app` |
| Test Dialer | `https://your-railway-url.railway.app/test-dialer` |
| Twilio Console | https://console.twilio.com/ |
| Deepgram Dashboard | https://console.deepgram.com/ |

---

## ⚡ Pro Tips

1. **Use Railway CLI for faster deployments**:
   ```bash
   npx @railway/cli login
   npx @railway/cli up
   ```

2. **Set up GitHub auto-deploy**:
   - Already configured! Every push to `main` deploys automatically

3. **Add custom domain**:
   - Railway Settings → Networking → Add custom domain
   - Point your DNS to Railway

4. **Monitor costs**:
   - Railway Dashboard → Usage tab
   - Set spending limits if needed

---

## 🆘 Need Help?

- Railway Discord: https://discord.gg/railway
- Deepgram Support: https://developers.deepgram.com
- Twilio Docs: https://www.twilio.com/docs

---

**Ready to deploy? Start with Step 1! 🚀**
