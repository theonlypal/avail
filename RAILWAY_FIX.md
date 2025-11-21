# 🔧 Railway Database Connection Fix

## Issue

The error `"Postgres connection not available - missing POSTGRES_URL"` means Railway isn't passing the database URL to your app.

## Solution: Add DATABASE_URL Variable Manually

Railway creates a PostgreSQL service but you need to **manually connect it** to your web service.

### Step 1: Get the Database URL

1. In Railway dashboard, click on your **PostgreSQL** service (not the web service)
2. Go to **"Variables"** tab
3. Look for `DATABASE_URL` - copy the entire value
4. It will look like: `postgresql://postgres:password@region.railway.app:5432/railway`

### Step 2: Add to Web Service

1. Click on your **web service** (the Next.js app)
2. Go to **"Variables"** tab
3. Click **"Add Variable"**
4. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL URL from Step 1

OR use Railway's reference syntax:
   - **Name**: `DATABASE_URL`
   - **Value**: `${{Postgres.DATABASE_URL}}`

5. Railway will automatically redeploy

### Step 3: Verify

After redeploy, visit:
```
https://avail-production.up.railway.app/api/init-db
```

Should return:
```json
{
  "success": true,
  "message": "Postgres database schema initialized successfully"
}
```

---

## Alternative: Use Railway's Service Linking

Railway has a feature to auto-link services:

1. Click on your **web service**
2. Go to **"Settings"** tab
3. Scroll to **"Service Variables"** or **"Connected Services"**
4. Click **"Add Service"** or **"Link Service"**
5. Select your PostgreSQL database
6. Railway will automatically add the connection variables

---

## Verify Environment Variables

After adding, check your web service has these variables:

```
DATABASE_URL=postgresql://...
DEEPGRAM_API_KEY=10cadc2e6f5b24b1a512b2e137ecbf6bad69efba
TWILIO_ACCOUNT_SID=AC99a7017187256d82a02b4b837f3fea81
TWILIO_AUTH_TOKEN=fd1b4fc2b6cbc5bb89a6e0d32703f6fb
TWILIO_PHONE_NUMBER=+12132052620
ANTHROPIC_API_KEY=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
ASSEMBLYAI_API_KEY=95901a2b922b4cbda64514701b095b66
GOOGLE_PLACES_API_KEY=AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY
SERPER_API_KEY=3cb1aef55d0993bb11765e80e9f483e64f672de8
NEXT_PUBLIC_APP_URL=https://avail-production.up.railway.app
```

---

## Quick Fix Commands

If you prefer CLI:

```bash
# Login to Railway
npx @railway/cli login

# Link to your project
npx @railway/cli link

# Add DATABASE_URL variable
npx @railway/cli variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## After Fix

Once `DATABASE_URL` is properly set:

1. Railway will redeploy automatically
2. Visit `/api/init-db` to create tables
3. Homepage should load without errors
4. Test dialer should work
5. Dual-side transcription ready to test!

---

**Do this now**: Add `DATABASE_URL` variable to your web service in Railway dashboard!
