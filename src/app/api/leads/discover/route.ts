import { NextRequest, NextResponse } from "next/server";
import { discoverLeads, discoverLeadsMultiLocation, rankLeads } from "@/lib/ai-lead-discovery";
import { getDb } from "@/lib/db";

/**
 * POST /api/leads/discover
 *
 * Discovers real leads using AI-powered search
 *
 * Body:
 * {
 *   "industry": "HVAC",
 *   "location": "San Diego, CA",  // or locations: ["San Diego, CA", "Los Angeles, CA"]
 *   "maxResults": 20,
 *   "saveToDb": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      industry,
      location,
      locations,
      maxResults = 20,
      minRating,
      saveToDb = false,
      teamId,
    } = body;

    // Validate inputs
    if (!industry) {
      return NextResponse.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    if (!location && !locations) {
      return NextResponse.json(
        { error: "Location or locations array is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Starting lead discovery: ${industry} in ${location || locations.join(", ")}`);

    // Discover leads
    let result;
    if (locations && Array.isArray(locations)) {
      result = await discoverLeadsMultiLocation(
        industry,
        locations,
        Math.floor(maxResults / locations.length)
      );
    } else {
      result = await discoverLeads({
        industry,
        location,
        maxResults,
        minRating,
      });
    }

    // Rank leads by opportunity score
    const rankedLeads = rankLeads(result.leads);

    console.log(`[API] Discovery complete: ${rankedLeads.length} qualified leads`);

    // Save to database if requested
    if (saveToDb && rankedLeads.length > 0) {
      try {
        const db = getDb();
        const insertedCount = await saveLeadsToDatabase(db, rankedLeads, teamId);
        console.log(`[API] Saved ${insertedCount} leads to database`);

        return NextResponse.json({
          success: true,
          leads: rankedLeads,
          totalFound: result.totalFound,
          savedToDb: insertedCount,
          searchQuery: result.searchQuery,
          timestamp: result.timestamp,
        });
      } catch (dbError) {
        console.error("[API] Database save error:", dbError);
        // Still return the leads even if DB save fails
        return NextResponse.json({
          success: true,
          leads: rankedLeads,
          totalFound: result.totalFound,
          savedToDb: 0,
          dbError: "Failed to save to database",
          searchQuery: result.searchQuery,
          timestamp: result.timestamp,
        });
      }
    }

    return NextResponse.json({
      success: true,
      leads: rankedLeads,
      totalFound: result.totalFound,
      searchQuery: result.searchQuery,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("[API] Lead discovery error:", error);
    return NextResponse.json(
      {
        error: "Lead discovery failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Save discovered leads to database
 */
async function saveLeadsToDatabase(
  db: any,
  leads: any[],
  teamId?: string
): Promise<number> {
  let insertedCount = 0;

  // Get or create default team
  let team = db
    .prepare("SELECT id FROM teams LIMIT 1")
    .get() as { id: string } | undefined;

  if (!team) {
    // Create default team if none exists
    const teamIdToUse = teamId || crypto.randomUUID();
    db.prepare(
      `INSERT INTO teams (id, name, industry, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(teamIdToUse, "Sales Team", "Multi-Industry", Date.now(), Date.now());

    team = { id: teamIdToUse };
  }

  for (const lead of leads) {
    try {
      // Check if lead already exists (by phone or business_name+location)
      let existing;
      if (lead.phone) {
        existing = db
          .prepare("SELECT id FROM leads WHERE phone = ?")
          .get(lead.phone);
      } else {
        const location = `${lead.city}, ${lead.state}`;
        existing = db
          .prepare("SELECT id FROM leads WHERE business_name = ? AND location LIKE ?")
          .get(lead.name, `%${lead.city}%`);
      }

      if (existing) {
        console.log(`[DB] Skipping duplicate: ${lead.name}`);
        continue;
      }

      // Insert lead
      const leadId = crypto.randomUUID();
      const now = new Date().toISOString();
      const location = `${lead.city}, ${lead.state}`;

      db.prepare(
        `INSERT INTO leads (
          id, team_id, business_name, industry, location, phone, email, website,
          rating, review_count, opportunity_score, pain_points,
          source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        leadId,
        team.id,
        lead.name,
        lead.industry,
        location,
        lead.phone,
        lead.email,
        lead.website,
        lead.rating || 0,
        lead.reviewCount || 0,
        lead.opportunityScore,
        JSON.stringify(lead.painPoints),
        lead.source,
        now,
        now
      );

      insertedCount++;
      console.log(`[DB] ✓ Inserted: ${lead.name} (score: ${lead.opportunityScore})`);
    } catch (error) {
      console.error(`[DB] Error inserting lead ${lead.name}:`, error);
      continue;
    }
  }

  return insertedCount;
}

/**
 * GET /api/leads/discover
 *
 * Get discovery job status or start a quick test discovery
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test");

  if (test === "true") {
    // Quick test discovery - 5 HVAC leads in San Diego
    try {
      const result = await discoverLeads({
        industry: "HVAC",
        location: "San Diego, CA",
        maxResults: 5,
      });

      return NextResponse.json({
        success: true,
        test: true,
        leads: result.leads,
        message: `Found ${result.leads.length} leads in test discovery`,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: "Test discovery failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: "Lead Discovery API",
    endpoints: {
      "POST /api/leads/discover": "Discover leads with AI",
      "GET /api/leads/discover?test=true": "Run test discovery",
    },
    apiKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      serper: !!process.env.SERPER_API_KEY,
    },
  });
}
