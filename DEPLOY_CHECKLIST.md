# ✅ Deployment Checklist - Leadly.AI

Quick reference guide to deploy your app to Vercel with Turso database.

---

## 📋 Before You Deploy

### 1. ✅ Filters & Features Updated
- [x] Lead filters with verification status
- [x] Website status filter
- [x] Verified field in Lead type
- [x] 98 verified leads in local database

### 2. ✅ Turso Database Setup

**Install Turso CLI:**
```bash
brew install tursodatabase/tap/turso
```

**Create & Configure:**
```bash
turso auth signup
turso auth login
turso db create leadly-ai
turso db show leadly-ai --url     # Copy this URL
turso db tokens create leadly-ai  # Copy this token
```

**Migrate Your Leads (Optional but Recommended):**
```bash
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
turso db create leadly-ai --from-file data/leadly.db
```

This copies all 98 verified leads to your cloud database!

---

## 🚀 Deploy to Vercel

### Option A: Via Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"

2. **Connect Repository:**
   - Select your repository
   - Click "Import"

3. **Configure Project:**
   - Framework: `Next.js` (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables:**

   Click "Environment Variables" and add these for **Production, Preview, Development**:

   ```
   ANTHROPIC_API_KEY=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
   
   TURSO_DATABASE_URL=<paste your URL from above>
   TURSO_AUTH_TOKEN=<paste your token from above>
   
   CRON_SECRET=<generate with: openssl rand -base64 32>
   ```

   Optional (for enhanced features):
   ```
   GOOGLE_MAPS_API_KEY=
   YELP_API_KEY=
   PERPLEXITY_API_KEY=
   NEXT_PUBLIC_MAPBOX_TOKEN=
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 3-5 minutes
   - Get your live URL! 🎉

### Option B: Via CLI

```bash
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
export PATH="/usr/local/bin:$PATH"

# Login
npx vercel login

# Deploy to production
npx vercel --prod

# When prompted, set environment variables
```

---

## ✅ Post-Deployment Verification

### 1. Test Your Deployment

Visit your Vercel URL and verify:

- ✅ Homepage loads correctly
- ✅ Dashboard shows leads
- ✅ AI Copilot sidebar works
- ✅ Lead filters work (including verification status)
- ✅ No console errors

### 2. Test Database Connection

Your app should automatically connect to Turso. Check the Vercel logs:

```bash
npx vercel logs <your-deployment-url>
```

Look for: `🌐 Using Turso cloud database`

### 3. Verify Lead Data

If you migrated data, check it loaded:

```bash
turso db shell leadly-ai
```

In the shell:
```sql
SELECT COUNT(*) as total FROM leads;
SELECT COUNT(*) as verified FROM leads WHERE verified = 1;
```

You should see your 98 leads!

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:** Build logs in Vercel dashboard
**Solution:** Most common issues:
- Missing environment variables
- TypeScript errors (we fixed these!)
- Missing dependencies

### Issue: Database Connection Fails

**Check:** 
1. Environment variables are set correctly in Vercel
2. `TURSO_DATABASE_URL` starts with `libsql://`
3. `TURSO_AUTH_TOKEN` is the full token (starts with `eyJ`)

**Solution:**
```bash
# Verify credentials work locally first
turso db show leadly-ai
turso db shell leadly-ai "SELECT 1"
```

### Issue: Leads Not Showing

**Solution:** Make sure you migrated your data to Turso:
```bash
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
sqlite3 data/leadly.db .dump | turso db shell leadly-ai
```

### Issue: AI Features Not Working

**Check:** `ANTHROPIC_API_KEY` is set in Vercel environment variables

**Solution:** Go to Vercel → Project → Settings → Environment Variables and verify the key is there

---

## 📊 Monitor Your Deployment

### Vercel Dashboard

- **Analytics:** Traffic and performance
- **Functions:** Check execution logs
- **Deployments:** View all deployments
- **Logs:** Real-time application logs

### Turso Dashboard

Visit [turso.tech/app](https://turso.tech/app) to:
- View database stats
- Monitor queries
- Check storage usage
- View connection count

---

## 🎉 You're Live!

Your Leadly.AI application is now deployed and accessible worldwide!

**What's Working:**
✅ AI-powered lead search  
✅ 98 verified San Diego businesses  
✅ Lead filtering (verification, website, score)  
✅ AI Copilot sidebar  
✅ Verification system  
✅ Cloud database (Turso)

**Next Steps:**
1. Share your deployment URL
2. Test all features thoroughly
3. Set up custom domain (optional)
4. Monitor usage and performance

---

## 📚 Documentation

- **Main Guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Turso Setup:** [TURSO_SETUP.md](TURSO_SETUP.md)
- **Verification System:** [VERIFICATION_SYSTEM.md](VERIFICATION_SYSTEM.md)

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Turso Docs:** https://docs.turso.tech
- **Next.js Docs:** https://nextjs.org/docs

**Happy Deploying! 🚀**
