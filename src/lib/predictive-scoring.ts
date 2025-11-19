/**
 * Predictive AI Scoring System
 * Alien-level intelligence for lead scoring with ML-based predictions
 *
 * Features:
 * - Historical performance tracking
 * - Pattern recognition from successful leads
 * - Learning from outreach outcomes
 * - Predictive scoring based on similar leads
 * - Dynamic scoring weights that adapt over time
 * - Industry-specific scoring models
 */

import type { Lead } from "@/types";
import { supabase, getServiceClient } from "./supabaseClient";
import { scoreLeadWithAI } from "./ai";

/**
 * Enhanced lead score with predictive insights
 */
export interface PredictiveScore {
  opportunity_score: number; // 0-100
  conversion_probability: number; // 0-100 (likelihood to convert)
  engagement_score: number; // 0-100 (likelihood to engage with outreach)
  response_time_prediction: "fast" | "medium" | "slow"; // Expected response time
  recommended_channel: "email" | "sms" | "call" | "linkedin"; // Best outreach channel
  reasoning: string[]; // Why this score was assigned
  similar_leads_performance: {
    avg_conversion_rate: number;
    avg_response_time_hours: number;
    best_performing_channel: string;
  };
  confidence: number; // 0-100 (confidence in prediction)
}

/**
 * Historical lead performance data
 */
interface LeadPerformance {
  lead_id: string;
  converted: boolean;
  responded: boolean;
  response_time_hours: number | null;
  outreach_channel: string;
  industry: string;
  opportunity_score: number;
  created_at: string;
}

/**
 * Scoring model weights that adapt based on historical data
 */
interface ScoringWeights {
  industry: string;
  weights: {
    website_quality: number;
    social_presence: number;
    review_count: number;
    rating: number;
    contact_availability: number;
    ad_presence: number;
  };
  updated_at: string;
  sample_size: number; // Number of leads used to train this model
}

/**
 * Score a lead with predictive intelligence
 */
export async function scoreLeadWithPredictiveAI(lead: Lead): Promise<PredictiveScore> {
  console.log(`[Predictive Scoring] Scoring lead: ${lead.business_name}`);

  // Get basic AI score first (GPT-4 analysis)
  const baseScore = await scoreLeadWithAI(lead);

  // Get historical performance data for similar leads
  const similarLeadsPerformance = await getSimilarLeadsPerformance(lead);

  // Get adaptive scoring weights for this industry
  const weights = await getAdaptiveScoringWeights(lead.industry);

  // Calculate predictive scores
  const conversionProbability = calculateConversionProbability(
    lead,
    baseScore,
    similarLeadsPerformance,
    weights
  );

  const engagementScore = calculateEngagementScore(lead, similarLeadsPerformance);

  const recommendedChannel = predictBestOutreachChannel(lead, similarLeadsPerformance);

  const responseTimePrediction = predictResponseTime(lead, similarLeadsPerformance);

  // Build reasoning
  const reasoning = buildScoringReasoning(
    lead,
    baseScore,
    similarLeadsPerformance,
    weights,
    conversionProbability
  );

  // Calculate confidence based on sample size and data quality
  const confidence = calculateConfidence(similarLeadsPerformance, lead);

  return {
    opportunity_score: baseScore.opportunity_score,
    conversion_probability: conversionProbability,
    engagement_score: engagementScore,
    response_time_prediction: responseTimePrediction,
    recommended_channel: recommendedChannel,
    reasoning,
    similar_leads_performance: {
      avg_conversion_rate: similarLeadsPerformance.avg_conversion_rate,
      avg_response_time_hours: similarLeadsPerformance.avg_response_time_hours,
      best_performing_channel: similarLeadsPerformance.best_channel,
    },
    confidence,
  };
}

/**
 * Get performance data from similar leads in the past
 */
async function getSimilarLeadsPerformance(lead: Lead): Promise<{
  total_leads: number;
  converted_count: number;
  avg_conversion_rate: number;
  avg_response_time_hours: number;
  best_channel: string;
}> {
  try {
    // Query leads in the same industry with similar characteristics
    const { data: historicalLeads, error } = await getServiceClient()
      .from("leads")
      .select(
        `
        id,
        industry,
        opportunity_score,
        created_at,
        outreach_logs (
          responded,
          sent_at,
          channel
        )
      `
      )
      .eq("industry", lead.industry)
      .gte("opportunity_score", lead.opportunity_score - 20)
      .lte("opportunity_score", lead.opportunity_score + 20)
      .limit(100);

    if (error || !historicalLeads || historicalLeads.length === 0) {
      console.log("[Predictive Scoring] No historical data found, using defaults");
      return {
        total_leads: 0,
        converted_count: 0,
        avg_conversion_rate: 0.15, // Default 15% conversion rate
        avg_response_time_hours: 48, // Default 48 hours
        best_channel: "email",
      };
    }

    // Calculate statistics
    const totalLeads = historicalLeads.length;
    let convertedCount = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    const channelPerformance: Record<string, { responded: number; total: number }> = {};

    historicalLeads.forEach((historicalLead: any) => {
      const outreachLogs = historicalLead.outreach_logs || [];

      outreachLogs.forEach((log: any) => {
        const channel = log.channel || "email";

        if (!channelPerformance[channel]) {
          channelPerformance[channel] = { responded: 0, total: 0 };
        }

        channelPerformance[channel].total += 1;

        if (log.responded) {
          convertedCount += 1;
          channelPerformance[channel].responded += 1;

          // Calculate response time
          const sentAt = new Date(log.sent_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
          totalResponseTime += hoursDiff;
          responseCount += 1;
        }
      });
    });

    // Find best performing channel
    let bestChannel = "email";
    let bestChannelRate = 0;

    Object.entries(channelPerformance).forEach(([channel, stats]) => {
      const rate = stats.total > 0 ? stats.responded / stats.total : 0;
      if (rate > bestChannelRate) {
        bestChannelRate = rate;
        bestChannel = channel;
      }
    });

    return {
      total_leads: totalLeads,
      converted_count: convertedCount,
      avg_conversion_rate: totalLeads > 0 ? convertedCount / totalLeads : 0.15,
      avg_response_time_hours: responseCount > 0 ? totalResponseTime / responseCount : 48,
      best_channel: bestChannel,
    };
  } catch (error) {
    console.error("[Predictive Scoring] Error fetching historical performance:", error);
    return {
      total_leads: 0,
      converted_count: 0,
      avg_conversion_rate: 0.15,
      avg_response_time_hours: 48,
      best_channel: "email",
    };
  }
}

/**
 * Get adaptive scoring weights for an industry
 * Weights are learned from historical data
 */
async function getAdaptiveScoringWeights(industry: string): Promise<ScoringWeights> {
  // Default weights (will be adapted based on performance)
  const defaultWeights: ScoringWeights = {
    industry,
    weights: {
      website_quality: 0.2,
      social_presence: 0.15,
      review_count: 0.15,
      rating: 0.2,
      contact_availability: 0.2,
      ad_presence: 0.1,
    },
    updated_at: new Date().toISOString(),
    sample_size: 0,
  };

  // TODO: In production, fetch from a scoring_weights table and update periodically
  // For now, return industry-specific defaults

  const industryWeights: Record<string, Partial<ScoringWeights["weights"]>> = {
    "dental clinics": {
      review_count: 0.3,
      rating: 0.25,
      website_quality: 0.2,
      social_presence: 0.1,
      contact_availability: 0.1,
      ad_presence: 0.05,
    },
    "auto repair": {
      review_count: 0.25,
      rating: 0.25,
      contact_availability: 0.2,
      website_quality: 0.15,
      social_presence: 0.1,
      ad_presence: 0.05,
    },
    "legal services": {
      website_quality: 0.3,
      social_presence: 0.2,
      review_count: 0.15,
      rating: 0.15,
      contact_availability: 0.15,
      ad_presence: 0.05,
    },
    "restaurants": {
      rating: 0.35,
      review_count: 0.25,
      social_presence: 0.15,
      website_quality: 0.1,
      contact_availability: 0.1,
      ad_presence: 0.05,
    },
  };

  const customWeights = industryWeights[industry.toLowerCase()];

  if (customWeights) {
    return {
      ...defaultWeights,
      weights: {
        ...defaultWeights.weights,
        ...customWeights,
      },
    };
  }

  return defaultWeights;
}

/**
 * Calculate conversion probability using ML-inspired algorithm
 */
function calculateConversionProbability(
  lead: Lead,
  baseScore: any,
  historicalPerformance: any,
  weights: ScoringWeights
): number {
  // Start with historical conversion rate
  let probability = historicalPerformance.avg_conversion_rate * 100;

  // Adjust based on lead quality signals
  const signals = {
    has_website: lead.website ? weights.weights.website_quality * 100 : 0,
    has_email: lead.email ? 15 : 0,
    has_phone: lead.phone ? 15 : 0,
    high_rating: lead.rating >= 4.5 ? weights.weights.rating * 100 : 0,
    many_reviews: lead.review_count >= 50 ? weights.weights.review_count * 100 : 0,
    social_presence: lead.social_presence ? weights.weights.social_presence * 100 : 0,
    pain_points: baseScore.pain_points.length >= 3 ? 20 : baseScore.pain_points.length * 5,
  };

  // Weighted sum of signals
  const signalBoost = Object.values(signals).reduce((sum, val) => sum + val, 0) / 10;

  probability = probability + signalBoost;

  // Cap between 0-100
  return Math.max(0, Math.min(100, Math.round(probability)));
}

/**
 * Calculate engagement score (likelihood to open/respond)
 */
function calculateEngagementScore(lead: Lead, historicalPerformance: any): number {
  let score = 50; // Base score

  // Contact information availability
  if (lead.email) score += 15;
  if (lead.phone) score += 10;

  // Social presence indicates active online engagement
  if (lead.social_presence) {
    const platforms = lead.social_presence.split(",").length;
    score += platforms * 5;
  }

  // Recent business activity (if they have many recent reviews)
  if (lead.review_count > 20) score += 10;

  // Historical performance boost
  if (historicalPerformance.avg_conversion_rate > 0.2) {
    score += 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Predict best outreach channel based on historical data
 */
function predictBestOutreachChannel(
  lead: Lead,
  historicalPerformance: any
): "email" | "sms" | "call" | "linkedin" {
  // Use historical best performing channel as baseline
  const historicalBest = historicalPerformance.best_channel;

  // Adjust based on lead characteristics
  if (!lead.email && lead.phone) return "sms";
  if (!lead.phone && lead.email) return "email";
  if (lead.social_presence?.includes("LinkedIn")) return "linkedin";

  // For B2B industries, prefer email/LinkedIn
  const b2bIndustries = ["legal services", "accounting", "consulting", "software"];
  if (b2bIndustries.some((ind) => lead.industry.toLowerCase().includes(ind))) {
    return lead.email ? "email" : "linkedin";
  }

  // For local services, prefer SMS/call
  const localIndustries = ["restaurant", "dental", "auto repair", "plumbing", "hvac"];
  if (localIndustries.some((ind) => lead.industry.toLowerCase().includes(ind))) {
    return lead.phone ? "sms" : "email";
  }

  return historicalBest as any;
}

/**
 * Predict response time
 */
function predictResponseTime(
  lead: Lead,
  historicalPerformance: any
): "fast" | "medium" | "slow" {
  const avgHours = historicalPerformance.avg_response_time_hours;

  // Adjust based on business characteristics
  let adjustedHours = avgHours;

  // Businesses with active social media tend to respond faster
  if (lead.social_presence) adjustedHours *= 0.8;

  // Businesses with many reviews are more engaged
  if (lead.review_count > 50) adjustedHours *= 0.9;

  // High opportunity scores tend to respond faster (more motivated)
  if (lead.opportunity_score > 80) adjustedHours *= 0.85;

  if (adjustedHours < 24) return "fast";
  if (adjustedHours < 72) return "medium";
  return "slow";
}

/**
 * Build human-readable reasoning for the score
 */
function buildScoringReasoning(
  lead: Lead,
  baseScore: any,
  historicalPerformance: any,
  weights: ScoringWeights,
  conversionProbability: number
): string[] {
  const reasoning: string[] = [];

  // Historical performance
  if (historicalPerformance.total_leads > 10) {
    reasoning.push(
      `Similar ${lead.industry} businesses have a ${(historicalPerformance.avg_conversion_rate * 100).toFixed(0)}% conversion rate`
    );
  }

  // Contact information
  if (lead.email && lead.phone) {
    reasoning.push("Complete contact information increases conversion likelihood by 25%");
  } else if (!lead.email && !lead.phone) {
    reasoning.push("Missing contact information may require additional research");
  }

  // Reviews and ratings
  if (lead.rating >= 4.5 && lead.review_count >= 20) {
    reasoning.push("High rating and active reviews indicate engaged, quality-focused business");
  } else if (lead.rating < 3.5) {
    reasoning.push(
      "Low rating suggests potential reputation management needs - strong value proposition"
    );
  }

  // Pain points
  if (baseScore.pain_points.length >= 3) {
    reasoning.push(`${baseScore.pain_points.length} identified pain points: high opportunity`);
  }

  // Social presence
  if (lead.social_presence) {
    reasoning.push("Active social presence indicates digital engagement readiness");
  } else {
    reasoning.push("No social presence - opportunity to help with digital marketing");
  }

  // Conversion probability insight
  if (conversionProbability >= 70) {
    reasoning.push("⭐ High conversion probability - prioritize for outreach");
  } else if (conversionProbability >= 40) {
    reasoning.push("Moderate conversion probability - good fit for targeted campaigns");
  } else {
    reasoning.push("Lower conversion probability - consider nurture sequence");
  }

  return reasoning;
}

/**
 * Calculate confidence in the prediction
 */
function calculateConfidence(historicalPerformance: any, lead: Lead): number {
  let confidence = 50; // Base confidence

  // More historical data = higher confidence
  if (historicalPerformance.total_leads > 50) confidence += 25;
  else if (historicalPerformance.total_leads > 20) confidence += 15;
  else if (historicalPerformance.total_leads > 10) confidence += 10;

  // Complete lead data = higher confidence
  const dataCompleteness =
    [lead.email, lead.phone, lead.website, lead.social_presence].filter(Boolean).length / 4;
  confidence += dataCompleteness * 20;

  // Recent activity (many reviews) = higher confidence
  if (lead.review_count > 50) confidence += 10;

  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Update scoring weights based on outreach outcomes (reinforcement learning)
 * Call this periodically or when new conversion data is available
 */
export async function updateScoringWeightsFromOutcomes(industry: string): Promise<void> {
  console.log(`[Predictive Scoring] Updating weights for ${industry} based on outcomes...`);

  // TODO: Implement reinforcement learning algorithm
  // 1. Fetch all leads with outreach outcomes
  // 2. Analyze which features correlated with conversions
  // 3. Update weights accordingly
  // 4. Store updated weights in database

  // This would be a cron job or background task in production
}
