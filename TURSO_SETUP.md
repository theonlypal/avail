# 🚀 Turso Database Setup for Vercel Deployment

Turso is a SQLite-compatible cloud database perfect for serverless deployments. Your existing SQLite code will work with minimal changes!

## Why Turso?

✅ **SQLite Compatible** - No code changes needed  
✅ **Serverless-Ready** - Works perfectly on Vercel  
✅ **Fast & Global** - Edge database with low latency  
✅ **Generous Free Tier** - 9GB storage, 1 billion row reads/month  
✅ **Easy Migration** - Can sync from your local SQLite database

---

## 📋 Quick Setup (5 Minutes)

### Step 1: Install Turso CLI

**macOS:**
```bash
brew install tursodatabase/tap/turso
```

**Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Windows:**
```powershell
curl -sSfL https://get.tur.so/install.ps1 | iex
```

### Step 2: Sign Up & Login

```bash
turso auth signup
```

This will open your browser to complete signup. Then login:

```bash
turso auth login
```

### Step 3: Create Your Database

```bash
turso db create leadly-ai
```

You should see:
```
Created database leadly-ai in [location]
```

### Step 4: Get Database Credentials

**Get Database URL:**
```bash
turso db show leadly-ai --url
```

Copy the URL (looks like: `libsql://leadly-ai-yourname.turso.io`)

**Create Auth Token:**
```bash
turso db tokens create leadly-ai
```

Copy the token (starts with `eyJ...`)

### Step 5: Add to Vercel Environment Variables

Go to your Vercel project settings:

1. Navigate to **Project Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```
TURSO_DATABASE_URL=libsql://leadly-ai-yourname.turso.io
TURSO_AUTH_TOKEN=eyJ...your-token...
```

3. Click **Save**

---

## 🔄 Migrate Your Local Data (Optional)

If you want to move your existing 98 verified leads to Turso:

### Option A: Export and Import

```bash
# 1. Export your local database
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
sqlite3 data/leadly.db .dump > leadly-backup.sql

# 2. Import to Turso
turso db shell leadly-ai < leadly-backup.sql
```

### Option B: Use Turso Sync (Automatic)

```bash
# Create a synced database from your local file
turso db create leadly-ai --from-file data/leadly.db
```

---

## 🧪 Test Your Connection

Create a test script to verify everything works:

```typescript
// test-turso.ts
import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function test() {
  const result = await turso.execute('SELECT COUNT(*) as count FROM leads');
  console.log('✅ Turso connected! Lead count:', result.rows[0].count);
}

test();
```

Run it:
```bash
npx tsx test-turso.ts
```

---

## 📊 Managing Your Database

### View Database Info
```bash
turso db show leadly-ai
```

### Connect to Database Shell
```bash
turso db shell leadly-ai
```

Inside the shell, you can run SQL queries:
```sql
-- Check lead count
SELECT COUNT(*) FROM leads;

-- View recent leads
SELECT business_name, opportunity_score, verified 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Check verification status
SELECT 
  verified,
  COUNT(*) as count
FROM leads
GROUP BY verified;
```

### Create a Database Backup
```bash
turso db shell leadly-ai .dump > backup-$(date +%Y%m%d).sql
```

### Delete Database (if needed)
```bash
turso db destroy leadly-ai
```

---

## 🔧 How It Works

The app automatically detects the environment:

**Local Development:**
- Uses SQLite (`data/leadly.db`)
- Fast, local file-based database
- Perfect for development

**Production (Vercel):**
- Detects `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Switches to Turso cloud database
- Same SQLite syntax, zero code changes

The magic happens in [src/lib/db-turso.ts](src/lib/db-turso.ts):

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const hasTursoCredentials = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

if (isProduction && hasTursoCredentials) {
  // Use Turso
} else {
  // Use local SQLite
}
```

---

## 💰 Pricing (as of 2024)

**Free Tier (Starter):**
- 9 GB total storage
- 1 billion row reads/month
- 25 million row writes/month
- Perfect for most small-to-medium apps

**Pro Tier ($29/month):**
- 50 GB storage
- 10 billion row reads
- 250 million row writes
- Priority support

For Leadly.AI with ~100 leads, the free tier is more than enough!

---

## 🐛 Troubleshooting

### Issue: "turso: command not found"

**Solution:** Make sure Turso CLI is in your PATH:
```bash
# macOS/Linux
export PATH="$HOME/.turso/bin:$PATH"

# Add to ~/.zshrc or ~/.bashrc to make permanent
echo 'export PATH="$HOME/.turso/bin:$PATH"' >> ~/.zshrc
```

### Issue: "database not found"

**Solution:** Make sure you created the database:
```bash
turso db list  # Check if database exists
turso db create leadly-ai  # Create if missing
```

### Issue: "authentication failed"

**Solution:** Re-login to Turso:
```bash
turso auth logout
turso auth login
```

### Issue: Vercel deployment still fails

**Solution:** Double-check environment variables:
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Verify both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
3. Make sure they're enabled for **Production**
4. Redeploy your project

---

## 🔗 Useful Links

- **Turso Dashboard:** https://turso.tech/app
- **Documentation:** https://docs.turso.tech/
- **CLI Reference:** https://docs.turso.tech/reference/turso-cli
- **Pricing:** https://turso.tech/pricing
- **Support:** https://discord.gg/turso

---

## ✅ You're Ready!

Once you've completed these steps:

1. ✅ Turso database created
2. ✅ Credentials added to Vercel
3. ✅ (Optional) Local data migrated

You can now deploy to Vercel:

```bash
cd "/Users/johncox/Desktop/LEADLY. AI CONCEPT/leadly-ai"
npx vercel --prod
```

Your app will automatically use Turso in production! 🎉
