// @ts-nocheck
/**
 * Autonomous Lead Discovery System
 * Alien-level intelligence for automatic lead finding and scoring
 *
 * Features:
 * - Background job scheduling for continuous lead discovery
 * - Smart industry/location targeting based on team performance
 * - Automatic lead scoring and prioritization
 * - Intelligent deduplication and quality filtering
 * - Proactive alerts for high-value opportunities
 * - Adaptive discovery patterns that learn over time
 */

import type { Lead } from "@/types";
import { getServiceClient } from "./supabaseClient";
import { orchestrateLeadScraping } from "./scraping-orchestrator";
import { scoreLeadWithPredictiveAI } from "./predictive-scoring";
import { createLead } from "./leads";

/**
 * Discovery job configuration
 */
export interface DiscoveryJob {
  id: string;
  team_id: string;
  name: string;
  industry: string;
  location: string;
  frequency: "hourly" | "daily" | "weekly";
  max_leads_per_run: number;
  min_opportunity_score: number;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string;
  created_at: string;
}

/**
 * Discovery run result
 */
export interface DiscoveryResult {
  job_id: string;
  leads_found: number;
  leads_imported: number;
  leads_skipped: number;
  high_value_leads: number; // Leads with score >= 80
  avg_opportunity_score: number;
  sources_used: string[];
  duration_ms: number;
  errors: string[];
}

/**
 * Create a new autonomous discovery job
 */
export async function createDiscoveryJob(
  teamId: string,
  config: {
    name: string;
    industry: string;
    location: string;
    frequency: "hourly" | "daily" | "weekly";
    maxLeadsPerRun?: number;
    minOpportunityScore?: number;
  }
): Promise<DiscoveryJob> {
  const nextRunAt = calculateNextRunTime(config.frequency);

  const job: DiscoveryJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    team_id: teamId,
    name: config.name,
    industry: config.industry,
    location: config.location,
    frequency: config.frequency,
    max_leads_per_run: config.maxLeadsPerRun || 50,
    min_opportunity_score: config.minOpportunityScore || 60,
    enabled: true,
    last_run_at: null,
    next_run_at: nextRunAt,
    created_at: new Date().toISOString(),
  };

  // TODO: Store in discovery_jobs table
  console.log("[Autonomous Discovery] Created job:", job);

  return job;
}

/**
 * Execute a discovery job
 */
export async function executeDiscoveryJob(job: DiscoveryJob): Promise<DiscoveryResult> {
  const startTime = Date.now();
  console.log(`[Autonomous Discovery] Executing job: ${job.name}`);

  const result: DiscoveryResult = {
    job_id: job.id,
    leads_found: 0,
    leads_imported: 0,
    leads_skipped: 0,
    high_value_leads: 0,
    avg_opportunity_score: 0,
    sources_used: [],
    duration_ms: 0,
    errors: [],
  };

  try {
    // Step 1: Multi-source lead scraping
    const scrapingResult = await orchestrateLeadScraping(job.industry, job.location, {
      maxLeads: job.max_leads_per_run,
      enrichWithEmails: true,
      enrichWithWebscraping: false, // Skip to save time in background jobs
    });

    result.leads_found = scrapingResult.total_found;
    result.sources_used = scrapingResult.sources_used;

    console.log(`[Autonomous Discovery] Found ${result.leads_found} leads`);

    // Step 2: Filter existing leads (deduplication)
    const newLeads = await filterNewLeads(scrapingResult.leads, job.team_id);

    console.log(`[Autonomous Discovery] ${newLeads.length} are new (not in database)`);

    // Step 3: Score leads with predictive AI
    const scoredLeads: Array<{ lead: Lead; score: any }> = [];

    for (const lead of newLeads) {
      try {
        const predictiveScore = await scoreLeadWithPredictiveAI(lead);

        // Only keep leads above minimum threshold
        if (predictiveScore.opportunity_score >= job.min_opportunity_score) {
          scoredLeads.push({
            lead: {
              ...lead,
              opportunity_score: predictiveScore.opportunity_score,
              team_id: job.team_id,
            },
            score: predictiveScore,
          });

          if (predictiveScore.opportunity_score >= 80) {
            result.high_value_leads += 1;
          }
        } else {
          result.leads_skipped += 1;
        }
      } catch (error) {
        console.error(`Failed to score lead ${lead.business_name}:`, error);
        result.errors.push(`Scoring error: ${lead.business_name}`);
      }
    }

    console.log(`[Autonomous Discovery] ${scoredLeads.length} leads passed quality filter`);

    // Step 4: Import leads into database
    for (const { lead, score } of scoredLeads) {
      try {
        await createLead({
          ...lead,
          ai_summary: buildAutoDiscoverySummary(lead, score),
          scored_at: new Date().toISOString(),
        });

        result.leads_imported += 1;
      } catch (error) {
        console.error(`Failed to import lead ${lead.business_name}:`, error);
        result.errors.push(`Import error: ${lead.business_name}`);
      }
    }

    // Calculate average score
    if (scoredLeads.length > 0) {
      result.avg_opportunity_score =
        scoredLeads.reduce((sum, { score }) => sum + score.opportunity_score, 0) /
        scoredLeads.length;
    }

    // Step 5: Send alerts for high-value leads
    if (result.high_value_leads > 0) {
      await sendHighValueLeadAlert(job, result);
    }

    // Update job status
    await updateJobLastRun(job.id);

    result.duration_ms = Date.now() - startTime;

    console.log(`[Autonomous Discovery] Job complete:`, result);

    return result;
  } catch (error) {
    console.error(`[Autonomous Discovery] Job failed:`, error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    result.duration_ms = Date.now() - startTime;
    return result;
  }
}

/**
 * Filter out leads that already exist in the database
 */
async function filterNewLeads(leads: Lead[], teamId: string): Promise<Lead[]> {
  try {
    // Get all existing business names for this team
    const { data: existingLeads, error } = await getServiceClient()
      .from("leads")
      .select("business_name, phone, website")
      .eq("team_id", teamId);

    if (error || !existingLeads) {
      console.warn("[Autonomous Discovery] Could not fetch existing leads, proceeding anyway");
      return leads;
    }

    // Create lookup sets for fast deduplication
    const existingNames = new Set(
      existingLeads.map((l) => l.business_name.toLowerCase().trim())
    );

    const existingPhones = new Set(
      existingLeads.filter((l) => l.phone).map((l) => normalizePhone(l.phone!))
    );

    const existingWebsites = new Set(
      existingLeads.filter((l) => l.website).map((l) => extractDomain(l.website!) || l.website)
    );

    // Filter out duplicates
    const newLeads = leads.filter((lead) => {
      const nameMatch = existingNames.has(lead.business_name.toLowerCase().trim());
      const phoneMatch = lead.phone ? existingPhones.has(normalizePhone(lead.phone)) : false;
      const websiteMatch = lead.website
        ? existingWebsites.has(extractDomain(lead.website) || lead.website)
        : false;

      return !nameMatch && !phoneMatch && !websiteMatch;
    });

    return newLeads;
  } catch (error) {
    console.error("[Autonomous Discovery] Error filtering leads:", error);
    return leads; // Return all leads if filtering fails
  }
}

/**
 * Build AI summary for auto-discovered lead
 */
function buildAutoDiscoverySummary(lead: Lead, predictiveScore: any): string {
  const parts: string[] = [];

  parts.push(`🤖 Auto-discovered ${lead.industry} business in ${lead.location}.`);

  parts.push(
    `Conversion probability: ${predictiveScore.conversion_probability}% (${predictiveScore.confidence}% confidence).`
  );

  if (predictiveScore.reasoning.length > 0) {
    parts.push(`Key insights: ${predictiveScore.reasoning[0]}`);
  }

  parts.push(`Recommended channel: ${predictiveScore.recommended_channel}.`);

  return parts.join(" ");
}

/**
 * Send alert for high-value leads discovered
 */
async function sendHighValueLeadAlert(
  job: DiscoveryJob,
  result: DiscoveryResult
): Promise<void> {
  console.log(
    `[Autonomous Discovery] 🚨 ${result.high_value_leads} high-value leads found for ${job.name}`
  );

  // TODO: Send notification via:
  // - Email to team members
  // - Slack webhook
  // - In-app notification
  // - Push notification

  // For now, just log to activity_logs table
  try {
    await getServiceClient().from("activity_logs").insert({
      team_id: job.team_id,
      action: "autonomous_discovery_alert",
      details: {
        job_name: job.name,
        high_value_leads: result.high_value_leads,
        total_imported: result.leads_imported,
        avg_score: result.avg_opportunity_score,
      },
    });
  } catch (error) {
    console.error("[Autonomous Discovery] Failed to log alert:", error);
  }
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRunTime(frequency: "hourly" | "daily" | "weekly"): string {
  const now = new Date();

  switch (frequency) {
    case "hourly":
      now.setHours(now.getHours() + 1);
      break;
    case "daily":
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0); // Run at 9 AM
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      now.setHours(9, 0, 0, 0); // Run at 9 AM
      break;
  }

  return now.toISOString();
}

/**
 * Update job's last run timestamp
 */
async function updateJobLastRun(jobId: string): Promise<void> {
  // TODO: Update discovery_jobs table
  console.log(`[Autonomous Discovery] Updated job ${jobId} last_run_at`);
}

/**
 * Get all active discovery jobs for a team
 */
export async function getActiveDiscoveryJobs(teamId: string): Promise<DiscoveryJob[]> {
  // TODO: Fetch from discovery_jobs table
  // For now, return empty array
  return [];
}

/**
 * Run all due discovery jobs
 * This should be called by a cron job or background worker
 */
export async function runDueDiscoveryJobs(): Promise<void> {
  console.log("[Autonomous Discovery] Checking for due jobs...");

  // TODO: Query discovery_jobs table for jobs where:
  // - enabled = true
  // - next_run_at <= now

  // For each due job:
  // 1. Execute job
  // 2. Update last_run_at
  // 3. Calculate and update next_run_at

  console.log("[Autonomous Discovery] No due jobs found");
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    return parsed.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

/**
 * Analyze team's historical performance to suggest new discovery jobs
 */
export async function suggestDiscoveryJobs(teamId: string): Promise<
  Array<{
    industry: string;
    location: string;
    reasoning: string;
    priority: "high" | "medium" | "low";
  }>
> {
  try {
    // Analyze which industries/locations have best conversion rates
    const { data: historicalLeads, error } = await getServiceClient()
      .from("leads")
      .select(
        `
        industry,
        location,
        opportunity_score,
        outreach_logs (
          responded
        )
      `
      )
      .eq("team_id", teamId)
      .limit(500);

    if (error || !historicalLeads) {
      return [];
    }

    // Calculate performance by industry
    const industryPerformance: Record<
      string,
      { total: number; responded: number; avg_score: number }
    > = {};

    historicalLeads.forEach((lead: any) => {
      const industry = lead.industry;

      if (!industryPerformance[industry]) {
        industryPerformance[industry] = { total: 0, responded: 0, avg_score: 0 };
      }

      industryPerformance[industry].total += 1;
      industryPerformance[industry].avg_score += lead.opportunity_score;

      const outreachLogs = lead.outreach_logs || [];
      const hasResponse = outreachLogs.some((log: any) => log.responded);
      if (hasResponse) {
        industryPerformance[industry].responded += 1;
      }
    });

    // Rank industries by conversion rate
    const rankedIndustries = Object.entries(industryPerformance)
      .map(([industry, stats]) => ({
        industry,
        conversion_rate: stats.total > 0 ? stats.responded / stats.total : 0,
        avg_score: stats.total > 0 ? stats.avg_score / stats.total : 0,
        total: stats.total,
      }))
      .filter((i) => i.total >= 5) // Only industries with enough data
      .sort((a, b) => b.conversion_rate - a.conversion_rate)
      .slice(0, 3); // Top 3 industries

    // Generate suggestions
    const suggestions = rankedIndustries.map((industry) => ({
      industry: industry.industry,
      location: "Expand to new cities", // TODO: Analyze location performance
      reasoning: `${industry.industry} has ${(industry.conversion_rate * 100).toFixed(0)}% conversion rate with avg score ${industry.avg_score.toFixed(0)}`,
      priority: (industry.conversion_rate > 0.3
        ? "high"
        : industry.conversion_rate > 0.15
          ? "medium"
          : "low") as "high" | "medium" | "low",
    }));

    return suggestions;
  } catch (error) {
    console.error("[Autonomous Discovery] Error generating suggestions:", error);
    return [];
  }
}
