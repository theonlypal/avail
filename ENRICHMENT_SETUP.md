# 🚀 Lead Enrichment Setup Guide

## Overview

The lead enrichment system automatically finds business websites, scrapes them for contact information (emails, phone numbers), and updates AI scoring based on digital presence.

## Required API Key: Serper

You need a **Serper API** key to search for business websites.

### Step 1: Get Serper API Key (FREE - 2,500 searches/month)

1. Go to https://serper.dev/
2. Click "Sign Up" or "Get API Key"
3. Create a free account
4. Copy your API key from the dashboard

### Step 2: Add API Key to .env.local

1. Open `.env.local` file in your project root
2. Find the line: `SERPER_API_KEY=`
3. Paste your API key after the `=`:
   ```bash
   SERPER_API_KEY=your_actual_api_key_here
   ```
4. Save the file

## Running Enrichment

### Test on 3 Leads (Recommended First)

```bash
cd /Users/johncox/Desktop/LEADLY.\ AI\ CONCEPT/leadly-ai
PATH="/usr/local/bin:$PATH" /usr/local/bin/npx tsx scripts/test-enrich.ts
```

This will:
- Search for websites for 3 leads
- Scrape each website for emails, phones, social media
- Update the database with enriched data
- Show detailed progress

### Run on All 98 Leads

```bash
cd /Users/johncox/Desktop/LEADLY.\ AI\ CONCEPT/leadly-ai
PATH="/usr/local/bin:$PATH" /usr/local/bin/npx tsx scripts/enrich-leads.ts
```

Or use npm script:
```bash
npm run enrich
```

## What Gets Enriched

For each lead, the system will:

1. **Find Website** - Uses Google search via Serper API
   - Searches: "[Business Name] [Location] [Industry] official website"
   - Filters out directory sites (Yelp, Facebook, etc.)
   - Stores the official business website

2. **Scrape Contact Info** - Uses Puppeteer to extract:
   - ✉️ Email addresses
   - 📞 Phone numbers (additional beyond what we have)
   - 📱 Social media profiles (Facebook, Instagram, LinkedIn, Twitter)
   - 📝 Contact form presence

3. **Calculate Website Quality Score** (0-100):
   - Base: 50 points
   - +20 if emails found
   - +10 if phones found
   - +10 if contact form exists
   - +10 if social media present

4. **Update Opportunity Score**:
   - **+15** if NO website found (needs help!)
   - **+10** if NO email found (needs help!)
   - **+10** if NO social media (needs help!)
   - **-5** if website quality is excellent (less need)

## Rate Limiting

The script waits **2 seconds** between each lead to:
- Respect API rate limits
- Avoid being blocked by websites
- Stay within Serper free tier

**Time estimate:**
- 3 leads: ~30 seconds
- 98 leads: ~5-6 minutes

## Viewing Results

After enrichment, check your leads in the dashboard:

1. Go to http://localhost:3000/dashboard
2. Leads will now have:
   - Website URLs
   - Email addresses
   - Updated opportunity scores

## Troubleshooting

### "No SERPER_API_KEY found"

Make sure you:
1. Added the API key to `.env.local`
2. Saved the file
3. Restarted the script

### "Search API error: 403"

Your API key is invalid. Double-check:
1. You copied the entire key
2. No extra spaces before/after
3. The key is from https://serper.dev/

### "Search API error: 429"

You've hit the rate limit:
- Free tier: 2,500 searches/month
- Each lead uses 1 search
- Wait for next month or upgrade at https://serper.dev/pricing

### Puppeteer/Chromium errors

If you see browser-related errors:
```bash
# Install Chromium manually
npx puppeteer browsers install chrome
```

## API Costs

| Service | Purpose | Free Tier | Paid |
|---------|---------|-----------|------|
| **Serper** | Google Search | 2,500/month ($0) | $50/month for 10k |

For 98 leads:
- 98 searches = **FREE** (well within 2,500 limit)
- Can enrich ~25 times per month on free tier

## Next Steps

After enrichment:
1. Review enriched leads in dashboard
2. Filter by website quality score
3. Focus on high opportunity scores (85+)
4. Use email/phone data for outreach

## Scripts

- `scripts/test-enrich.ts` - Test on 3 leads
- `scripts/enrich-leads.ts` - Enrich all leads
- Both auto-load `.env.local` for API keys
