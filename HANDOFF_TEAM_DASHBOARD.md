# Team Dashboard Build - Complete Handoff Prompt

## Project Context
Leadly.AI is a lead generation platform that discovers businesses using Google Places API, scores them for sales opportunities, and manages them through a CRM pipeline. The location filtering system has been fixed and is working perfectly in production.

**Production URL:** https://leadly-jy8y0q5r4-rayan-pals-projects.vercel.app

## Current Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Neon PostgreSQL (production)
- **APIs:** Google Places API, Anthropic Claude API
- **Deployment:** Vercel
- **UI Components:** Radix UI primitives (already installed)

## Database Schema (Neon PostgreSQL)

### `teams` table
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `users` table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  team_id TEXT REFERENCES teams(id),
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `leads` table
```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id),
  business_name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  website TEXT,
  rating REAL,
  reviews_count INTEGER,
  opportunity_score INTEGER,
  stage TEXT DEFAULT 'new',
  assigned_to TEXT REFERENCES users(id),
  notes TEXT,
  last_contact TIMESTAMP,
  website_tech JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `activity_logs` table
```sql
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id),
  user_id TEXT REFERENCES users(id),
  lead_id TEXT REFERENCES leads(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables (Already Set in Production)
```
POSTGRES_URL=postgresql://neondb_owner:npg_lgY2jk5QbRUP@ep-autumn-lab-adw06pfn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
GOOGLE_PLACES_API_KEY=AIzaSyBLESUORNLmB19LlTMrcbxQBVvLd34_FoY
ANTHROPIC_API_KEY=sk-ant-api03-FV5uUfxQo0TfLPqKV5g4-g68gJ5lB8Muz8Nq1wNzEcIvqYN3K4rSDHCrTEe4f9_QCTTY_KGx29Lk4nWzKhIMdQ-WYDMkgAA
NEXT_PUBLIC_SITE_URL=https://leadly-jy8y0q5r4-rayan-pals-projects.vercel.app
```

## Existing Working Features (DO NOT MODIFY)
1. **AI Search** (`/api/ai/search`) - Claude-powered natural language search that extracts location and business type
2. **Google Places Integration** (`src/lib/google-places.ts`) - PERFECT location filtering with synthetic bounding box
3. **Lead Scoring** (`src/lib/scoring.ts`) - 100-point opportunity scoring system
4. **Website Tech Detection** (`src/lib/website-tech-detector.ts`) - Detects CMS platforms (WordPress, Wix, Squarespace, etc.)

## Your Mission: Build Complete Team Dashboard

### High-Level Requirements

Build a comprehensive team dashboard that allows users to:
1. View all leads in a filterable/sortable table or Kanban board
2. Manage leads through sales pipeline stages (drag-and-drop Kanban)
3. View individual lead details with all enrichment data
4. Add notes and log activities for each lead
5. Assign leads to team members
6. Filter and search leads by multiple criteria
7. Export leads to CSV
8. View team activity feed
9. See analytics and statistics

### Page Structure

Create the following pages under `/app/(dashboard)/` directory:

1. **`/dashboard`** - Main dashboard with stats and recent activity
2. **`/dashboard/leads`** - Lead management (table view with filters)
3. **`/dashboard/leads/[id]`** - Individual lead detail page
4. **`/dashboard/pipeline`** - Kanban board for pipeline management
5. **`/dashboard/team`** - Team members and activity
6. **`/dashboard/settings`** - Team settings

### Detailed Feature Specifications

#### 1. Dashboard Layout (`/dashboard`)

**Components to build:**
- Sidebar navigation with links to all dashboard sections
- Top header with user profile dropdown and search bar
- Main content area with:
  - Key metrics cards (Total Leads, Hot Leads, Conversion Rate, etc.)
  - Recent activity feed (last 10 activities)
  - Quick actions (Add Lead manually, Run AI Search, Export Data)
  - Charts (leads by stage, leads by score distribution)

**Required Stats:**
- Total leads
- Leads by stage (new, contacted, qualified, proposal, negotiation, closed-won, closed-lost)
- Average opportunity score
- High-priority leads (score > 70)
- Leads contacted this week
- Conversion rate

**Tech:**
- Use Recharts for charts
- Use Radix UI components for modals, dropdowns, etc.
- Real-time updates not required (standard data fetching is fine)

#### 2. Leads Table View (`/dashboard/leads`)

**Features:**
- Sortable columns: Name, Location, Score, Stage, Assigned To, Last Contact, Created
- Filterable by:
  - Stage (multi-select dropdown)
  - Score range (slider: 0-100)
  - Location (text input)
  - Assigned to (multi-select)
  - Date range (created/last contact)
- Search box (searches business name, location, website)
- Bulk actions: Assign, Change Stage, Export Selected
- Pagination (20 per page)
- Row actions: View Details, Edit, Delete, Add Note
- "Add Lead" button (opens modal to manually add lead)

**Table Columns:**
- Checkbox (for bulk selection)
- Business Name (with link to detail page)
- Location
- Opportunity Score (colored badge: red <40, yellow 40-69, green 70+)
- Stage (colored pill badge)
- Assigned To (avatar + name, or "Unassigned")
- Last Contact (relative time, e.g., "2 days ago")
- Actions (dropdown menu)

**API Endpoints to Create:**
- `GET /api/leads` - Fetch leads with filtering/sorting/pagination
- `POST /api/leads` - Manually add a lead
- `PATCH /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/bulk-update` - Bulk update leads

#### 3. Lead Detail Page (`/dashboard/leads/[id]`)

**Layout:**
- Left sidebar: Lead info card with key details
- Main content area: Tabbed interface

**Lead Info Card (Sidebar):**
- Business name (editable)
- Opportunity score (large number with color)
- Stage selector (dropdown to change stage)
- Assigned to selector (dropdown to assign/reassign)
- Contact info: Phone (with "Call" button), Website (with "Visit" link), Location
- Google rating and reviews count
- Website tech stack (if detected)
- Quick actions: Add Note, Log Activity, Delete Lead

**Tabs:**
- **Overview:** All lead details, enrichment data, scoring breakdown
- **Activity:** Timeline of all activities (notes, stage changes, assignments)
- **Notes:** All notes for this lead, with "Add Note" button
- **Emails/Calls:** Log of outreach attempts (future feature, just UI placeholder)

**Activity Timeline:**
- Each activity shows: Icon, Action type, User who did it, Timestamp, Details
- Types: Created, Stage Changed, Assigned, Note Added, Contacted, etc.

**API Endpoints to Create:**
- `GET /api/leads/[id]` - Fetch single lead with all data
- `POST /api/leads/[id]/notes` - Add note
- `POST /api/leads/[id]/activity` - Log activity
- `GET /api/leads/[id]/activity` - Get activity timeline

#### 4. Pipeline Kanban Board (`/dashboard/pipeline`)

**Features:**
- Drag-and-drop Kanban board with columns for each stage:
  - New
  - Contacted
  - Qualified
  - Proposal
  - Negotiation
  - Closed Won
  - Closed Lost
- Each card shows:
  - Business name
  - Location
  - Opportunity score badge
  - Assigned to (avatar)
  - Last contact indicator
- Click card to open lead detail modal or navigate to detail page
- Filter bar at top (same filters as table view)
- Column headers show count of leads in each stage

**Tech:**
- Use `@hello-pangea/dnd` (already installed) for drag-and-drop
- When dropped, immediately update lead stage via API
- Optimistic UI updates

**API Endpoints to Create:**
- `PATCH /api/leads/[id]/stage` - Update lead stage (called on drop)

#### 5. Team Page (`/dashboard/team`)

**Features:**
- Team member cards showing:
  - Avatar, name, email, role
  - Number of assigned leads
  - Recent activity
- "Invite Member" button (opens modal)
- Team activity feed (all activities across all users)

**Activity Feed:**
- Shows last 50 activities
- Filter by user
- Types: Lead created, Stage changed, Note added, Lead assigned, etc.

**API Endpoints to Create:**
- `GET /api/team/members` - Fetch all team members
- `POST /api/team/invite` - Invite new member (just adds to DB for now, no email)
- `GET /api/team/activity` - Fetch team activity log

#### 6. Settings Page (`/dashboard/settings`)

**Features:**
- Team settings:
  - Team name (editable)
  - Default lead assignment rules
  - Pipeline stage customization (future feature, just UI placeholder)
- User settings:
  - Name, email (editable)
  - Notification preferences (UI placeholder)
- Danger zone: Delete team (confirmation modal)

**API Endpoints to Create:**
- `GET /api/team/settings` - Fetch team settings
- `PATCH /api/team/settings` - Update team settings
- `PATCH /api/user/profile` - Update user profile

### Additional Features

#### Export to CSV
- Button on `/dashboard/leads` to export all filtered leads
- Endpoint: `GET /api/leads/export?<filters>`
- Returns CSV file with all lead data

#### Manual Lead Creation
- Modal form with fields: Business Name, Location, Phone, Website, Notes
- Automatically scores the lead if website is provided
- Endpoint: `POST /api/leads` (already mentioned above)

#### Search
- Global search bar in header
- Searches across business names, locations, websites
- Shows dropdown with top 5 results
- Endpoint: `GET /api/search?q=<query>`

### Design Guidelines

**Color Palette:**
- Primary: Blue (#3b82f6)
- Success/High Score: Green (#10b981)
- Warning/Medium Score: Yellow (#f59e0b)
- Danger/Low Score: Red (#ef4444)
- Neutral: Gray shades from Tailwind

**Typography:**
- Headings: font-semibold or font-bold
- Body: font-normal
- Use Tailwind's default font stack

**Components:**
- Use Radix UI primitives for all interactive components (already installed)
- Build reusable components in `src/components/dashboard/`
- Use Tailwind classes, no custom CSS files

**Responsive:**
- Mobile-first approach
- Sidebar collapses to hamburger menu on mobile
- Tables become cards on mobile
- Kanban board scrolls horizontally on mobile

### Code Organization

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx (dashboard layout with sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx (main dashboard)
│   │   ├── leads/
│   │   │   ├── page.tsx (leads table)
│   │   │   └── [id]/
│   │   │       └── page.tsx (lead detail)
│   │   ├── pipeline/
│   │   │   └── page.tsx (kanban board)
│   │   ├── team/
│   │   │   └── page.tsx (team page)
│   │   └── settings/
│   │       └── page.tsx (settings)
│   ├── api/
│   │   ├── leads/
│   │   │   ├── route.ts (GET, POST)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts (GET, PATCH, DELETE)
│   │   │   │   ├── notes/route.ts
│   │   │   │   ├── activity/route.ts
│   │   │   │   └── stage/route.ts
│   │   │   ├── bulk-update/route.ts
│   │   │   └── export/route.ts
│   │   ├── team/
│   │   │   ├── members/route.ts
│   │   │   ├── invite/route.ts
│   │   │   ├── activity/route.ts
│   │   │   └── settings/route.ts
│   │   ├── user/
│   │   │   └── profile/route.ts
│   │   └── search/route.ts
│   └── ...
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── LeadCard.tsx
│   │   ├── LeadTable.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── StatsCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── LeadDetailModal.tsx
│   │   ├── AddLeadModal.tsx
│   │   └── ...
│   └── ui/ (Radix UI wrappers)
└── lib/
    ├── db.ts (Neon SQL client - already exists)
    ├── google-places.ts (DO NOT MODIFY)
    ├── scoring.ts (DO NOT MODIFY)
    └── ...
```

### Database Client Usage

Use the existing Neon client:

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

// Query example
const leads = await sql`
  SELECT * FROM leads
  WHERE team_id = ${teamId}
  ORDER BY created_at DESC
`;
```

### Sample Data

For testing, use this sample team:
- Team ID: `cm3u2qe5g0000kslxvmm90uv9`
- Team Name: "Sales Team Alpha"

Create a script `scripts/seed-dashboard-data.ts` that adds:
- 3 sample users
- 50 sample leads across all stages
- 20 sample activity logs

### Critical Requirements

1. **DO NOT MODIFY** these files:
   - `src/lib/google-places.ts`
   - `src/lib/scoring.ts`
   - `src/lib/website-tech-detector.ts`
   - `src/app/api/ai/search/route.ts`

2. **Use existing database** - Neon PostgreSQL, connection string provided

3. **TypeScript strict mode** - All code must be properly typed

4. **Error handling** - Proper try/catch blocks, user-friendly error messages

5. **Loading states** - Show loading spinners/skeletons during data fetching

6. **Optimistic UI** - Update UI immediately, revert on error

7. **Security** - Validate all inputs, use parameterized queries (Neon client does this automatically)

8. **Performance** - Use React Server Components where possible, minimize client-side JS

### Deliverables

1. All page components with full functionality
2. All API endpoints with proper error handling
3. Reusable UI components in `src/components/dashboard/`
4. Sample data seeding script
5. Updated README with dashboard usage instructions

### Testing Checklist

- [ ] Can view dashboard with stats
- [ ] Can view leads table with sorting and filtering
- [ ] Can create a new lead manually
- [ ] Can view lead detail page
- [ ] Can add notes to a lead
- [ ] Can change lead stage
- [ ] Can assign lead to user
- [ ] Can drag leads between pipeline stages
- [ ] Can export leads to CSV
- [ ] Can view team activity
- [ ] All pages responsive on mobile
- [ ] No console errors
- [ ] No TypeScript errors

### Deployment

After building:
1. Test locally with `npm run dev`
2. Build with `npm run build` (must succeed with no errors)
3. Deploy to Vercel with `npx vercel --prod`
4. Verify all features work in production

### Questions?

If anything is unclear or you need design mockups, ask before implementing. The goal is a clean, functional dashboard that feels like a modern SaaS product.

Good luck! Build something amazing.
