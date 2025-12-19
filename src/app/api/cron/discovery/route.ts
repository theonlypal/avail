/**
 * Cron Job API Route - Autonomous Lead Discovery
 *
 * This endpoint should be called periodically by a cron service (e.g., Vercel Cron)
 * to run autonomous lead discovery jobs.
 *
 * Setup Instructions:
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/discovery",
 *        "schedule": "0 * * * *" // Runs every hour
 *      }]
 *    }
 *
 * 2. Or use external cron service (cron-job.org, EasyCron, etc.)
 *    Call: POST https://your-domain.com/api/cron/discovery
 *    With header: Authorization: Bearer YOUR_CRON_SECRET
 *
 * 3. Set environment variable:
 *    CRON_SECRET=your-secret-token-here
 */

import { NextResponse } from "next/server";
import { runDueDiscoveryJobs } from "@/lib/autonomous-discovery";

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[Cron] CRON_SECRET not set. Cron endpoint is unprotected!");
  }

  try {
    console.log("[Cron] Starting autonomous discovery jobs...");

    // Run all due discovery jobs
    await runDueDiscoveryJobs();

    return NextResponse.json({
      success: true,
      message: "Autonomous discovery jobs executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error running discovery jobs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute discovery jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
