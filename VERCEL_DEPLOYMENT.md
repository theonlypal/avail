# 🚀 Vercel Deployment Guide - Leadly.AI

Complete guide to deploy Leadly.AI to Vercel with all features working.

## 📋 Pre-Deployment Checklist

### 1. Build Test (Local)
```bash
npm run build
```
Make sure the build succeeds locally before deploying.

### 2. Required Environment Variables
You'll need at minimum:
- `ANTHROPIC_API_KEY` - For AI-powered features (REQUIRED)
- `CRON_SECRET` - For securing cron endpoints (generate with: `openssl rand -base64 32`)

### 3. Optional API Keys (for enhanced features)
- `GOOGLE_MAPS_API_KEY` - For Google Maps lead discovery
- `YELP_API_KEY` - For Yelp lead discovery  
- `PERPLEXITY_API_KEY` - For AI verification
- `NEXT_PUBLIC_MAPBOX_TOKEN` - For map visualizations

## 🎯 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel**
```bash
npx vercel login
```

2. **Link Your Project**
```bash
npx vercel link
```
- Choose "Link to existing project" or "Create new project"
- Follow the prompts

3. **Set Environment Variables**
```bash
# Set your Anthropic API key
npx vercel env add ANTHROPIC_API_KEY

# Set a cron secret
npx vercel env add CRON_SECRET

# Add any other optional keys
npx vercel env add GOOGLE_MAPS_API_KEY
npx vercel env add YELP_API_KEY
npx vercel env add PERPLEXITY_API_KEY
npx vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
```

Choose environment: `Production`, `Preview`, `Development` (select all 3)

4. **Deploy to Preview**
```bash
npx vercel
```

5. **Deploy to Production**
```bash
npx vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select "leadly-ai" folder if prompted

2. **Configure Project**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (or select leadly-ai if in subdirectory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   Go to Project Settings > Environment Variables and add:

   **Required:**
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   CRON_SECRET=your-random-secret-here
   ```

   **Optional:**
   ```
   GOOGLE_MAPS_API_KEY=your-key-here
   YELP_API_KEY=your-key-here
   PERPLEXITY_API_KEY=your-key-here
   NEXT_PUBLIC_MAPBOX_TOKEN=your-token-here
   ```

   > **Note:** See [TURSO_SETUP.md](TURSO_SETUP.md) for detailed Turso database setup instructions

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)
   - Visit your deployment URL

## 🔧 Post-Deployment Configuration

### 1. Verify Deployment
Visit your deployment URL and check:
- ✅ Homepage loads
- ✅ Dashboard shows leads table
- ✅ AI search bar accepts queries
- ✅ No console errors

### 2. Test AI Features
- Try AI Copilot sidebar
- Search for leads with natural language
- Verify AI responses work

### 3. Database Setup (Turso)

**Your app is already configured for Turso!** The database layer automatically switches between:
- **Local SQLite** during development (`data/leadly.db`)
- **Turso Cloud** in production (when credentials are set)

**Setup Turso (5 minutes):**

1. Follow the complete guide: [TURSO_SETUP.md](TURSO_SETUP.md)

Quick steps:
```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Sign up and login
turso auth signup
turso auth login

# Create database
turso db create leadly-ai

# Get credentials
turso db show leadly-ai --url
turso db tokens create leadly-ai
```

2. Add credentials to Vercel (as shown above)

3. **(Optional)** Migrate your 98 verified leads:
```bash
turso db create leadly-ai --from-file data/leadly.db
```

That's it! Your app will automatically use Turso in production. ✅

### 4. Configure Cron Jobs (Optional)

The `vercel.json` file includes a cron job configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/discovery",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs lead discovery hourly. Make sure:
1. `CRON_SECRET` is set in environment variables
2. Endpoint at `/api/cron/discovery` exists and is secured

## 🐛 Troubleshooting

### Build Fails
```bash
# Check TypeScript errors locally
npm run build

# Check for missing dependencies
npm install
```

### Environment Variables Not Working
- Make sure they're added to **Production** environment
- Redeploy after adding new variables
- Check for typos in variable names
- For `NEXT_PUBLIC_*` variables, rebuild is required

### Database Connection Errors
- Remember: SQLite doesn't work on Vercel (serverless)
- Switch to Turso or Supabase for production
- Check database URL format

### AI Features Not Working
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits
- Look at Function Logs in Vercel dashboard

### 404 Errors on Routes
- Check `next.config.ts` for correct rewrites
- Verify API routes exist in `src/app/api/`

### Slow Cold Starts
- Normal for serverless functions
- Consider upgrading to Vercel Pro for faster execution
- Optimize bundle size

## 📊 Monitoring

### Vercel Dashboard
- Analytics: Monitor traffic and performance
- Functions: Check execution logs
- Deployments: View build logs
- Runtime Logs: Debug production issues

### Enable Logging
Add to your code:
```typescript
console.log('[LeadlyAI] Event:', data);
```

View in Vercel Dashboard > Functions > Real-time Logs

## 🔐 Security Checklist

- ✅ All API keys in environment variables (not in code)
- ✅ `.env.local` in `.gitignore`
- ✅ `CRON_SECRET` set and validated in cron endpoints
- ✅ API routes properly secured
- ✅ CORS configured correctly
- ✅ Rate limiting on AI endpoints

## 📈 Performance Optimization

### 1. Enable Edge Runtime (where applicable)
```typescript
export const runtime = 'edge';
```

### 2. Optimize Images
- Use Next.js Image component
- Configure image domains in `next.config.ts`

### 3. Reduce Bundle Size
```bash
# Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## 🎉 You're Deployed!

Your Leadly.AI application is now live on Vercel!

### Next Steps:
1. Share your deployment URL
2. Set up a custom domain (optional)
3. Monitor performance in Vercel dashboard
4. Set up Supabase/Turso for persistent database

### Custom Domain Setup
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Leadly.AI Issues: Check your project documentation

**Happy Deploying! 🚀**
