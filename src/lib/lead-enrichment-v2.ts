/**
 * Lead Enrichment Pipeline V2
 * Enriches leads with website analysis, social presence, email discovery, and AI scoring
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Lead } from '@/types';
import { updateLead } from './leads-sqlite';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface EnrichmentResult {
  website_score: number;
  social_presence: string;
  ad_presence: boolean;
  email?: string;
  pain_points: string[];
  recommended_services: string[];
  ai_summary: string;
  opportunity_score: number;
}

/**
 * Analyze website quality and extract insights
 */
async function analyzeWebsite(website: string | null): Promise<{
  score: number;
  hasWebsite: boolean;
  insights: string;
}> {
  if (!website) {
    return {
      score: 0,
      hasWebsite: false,
      insights: 'No website found',
    };
  }

  try {
    console.log(`🌐 Analyzing website: ${website}`);

    // Try to fetch the website
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(website, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadlyBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        score: 30,
        hasWebsite: true,
        insights: `Website exists but returned status ${response.status}`,
      };
    }

    const html = await response.text();

    // Use Claude to analyze the website
    const analysisPrompt = `Analyze this business website HTML and rate it on a scale of 0-100. Consider:
- Design quality and modernity
- Mobile responsiveness indicators
- SEO optimization (meta tags, structure)
- Call-to-action presence
- Contact information accessibility
- Overall professionalism

Website: ${website}

HTML snippet (first 5000 chars):
${html.substring(0, 5000)}

Respond with JSON:
{
  "score": number (0-100),
  "insights": "brief analysis of strengths and weaknesses"
}

Return ONLY the JSON, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score || 50,
        hasWebsite: true,
        insights: result.insights || 'Website analyzed',
      };
    }

    return {
      score: 50,
      hasWebsite: true,
      insights: 'Website found, basic analysis completed',
    };
  } catch (error) {
    console.error(`❌ Error analyzing website ${website}:`, error);
    return {
      score: 40,
      hasWebsite: true,
      insights: 'Website exists but could not be fully analyzed',
    };
  }
}

/**
 * Check social media presence
 */
async function checkSocialPresence(businessName: string, website?: string | null): Promise<string> {
  const serperApiKey = process.env.SERPER_API_KEY;
  if (!serperApiKey) {
    return 'unknown';
  }

  try {
    const searchQuery = `${businessName} facebook OR instagram OR twitter OR linkedin`;

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 10,
      }),
    });

    if (!response.ok) {
      return 'unknown';
    }

    const data = await response.json();
    const results = data.organic || [];

    // Count social media platforms found
    const platforms = new Set<string>();

    results.forEach((result: any) => {
      const link = result.link?.toLowerCase() || '';
      if (link.includes('facebook.com')) platforms.add('facebook');
      if (link.includes('instagram.com')) platforms.add('instagram');
      if (link.includes('twitter.com') || link.includes('x.com')) platforms.add('twitter');
      if (link.includes('linkedin.com')) platforms.add('linkedin');
    });

    if (platforms.size === 0) return 'none';
    if (platforms.size === 1) return 'low';
    if (platforms.size === 2) return 'medium';
    return 'high';
  } catch (error) {
    console.error('❌ Error checking social presence:', error);
    return 'unknown';
  }
}

/**
 * Check for paid advertising presence
 */
async function checkAdPresence(businessName: string, location: string): Promise<boolean> {
  const serperApiKey = process.env.SERPER_API_KEY;
  if (!serperApiKey) {
    return false;
  }

  try {
    const searchQuery = `${businessName} ${location}`;

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 5,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    // Check if there are any ads in the results
    const hasAds = (data.ads && data.ads.length > 0) || false;

    return hasAds;
  } catch (error) {
    console.error('❌ Error checking ad presence:', error);
    return false;
  }
}

/**
 * Try to discover email address
 */
async function discoverEmail(website: string | null, businessName: string): Promise<string | null> {
  if (!website) return null;

  try {
    // Fetch website and look for email patterns
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(website, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadlyBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();

    // Look for email patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex);

    if (emails && emails.length > 0) {
      // Filter out common spam/bot emails
      const validEmails = emails.filter(
        (email) =>
          !email.includes('example.com') &&
          !email.includes('test.com') &&
          !email.includes('spam') &&
          !email.includes('noreply')
      );

      if (validEmails.length > 0) {
        return validEmails[0];
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ Error discovering email for ${website}:`, error);
    return null;
  }
}

/**
 * Use Claude to generate AI insights and scoring
 */
async function generateAIInsights(lead: Partial<Lead>, enrichmentData: Partial<EnrichmentResult>): Promise<{
  pain_points: string[];
  recommended_services: string[];
  ai_summary: string;
  opportunity_score: number;
}> {
  const prompt = `You are a sales expert analyzing a potential lead. Generate insights and scoring for this business:

Business Name: ${lead.business_name}
Industry: ${lead.industry}
Location: ${lead.location}
Rating: ${lead.rating || 'unknown'}
Review Count: ${lead.review_count || 'unknown'}
Website Score: ${enrichmentData.website_score || 0}/100
Social Presence: ${enrichmentData.social_presence || 'unknown'}
Has Paid Ads: ${enrichmentData.ad_presence ? 'Yes' : 'No'}
Website: ${lead.website || 'none'}

Your task:
1. Identify 3-5 potential pain points this business might have (e.g., "Low online visibility", "Outdated website", "Limited social media presence")
2. Recommend 3-5 services that would benefit them (e.g., "SEO optimization", "Social media management", "Website redesign")
3. Write a 2-3 sentence AI summary of this lead's potential
4. Calculate an opportunity score (0-100) based on:
   - How much room for improvement exists (more = higher score)
   - Market potential based on industry and location
   - Current online presence gaps
   - Rating and reviews (lower rating = more opportunity for improvement services)

Respond with JSON:
{
  "pain_points": ["pain 1", "pain 2", ...],
  "recommended_services": ["service 1", "service 2", ...],
  "ai_summary": "summary text",
  "opportunity_score": number (0-100)
}

Return ONLY the JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        pain_points: result.pain_points || [],
        recommended_services: result.recommended_services || [],
        ai_summary: result.ai_summary || 'Lead analyzed',
        opportunity_score: result.opportunity_score || 50,
      };
    }
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
  }

  // Fallback scoring
  const opportunityScore = calculateFallbackScore(lead, enrichmentData);

  return {
    pain_points: ['Potential for digital marketing improvement'],
    recommended_services: ['Digital marketing consultation'],
    ai_summary: `${lead.business_name} in ${lead.industry} with ${lead.rating || 'unknown'} rating.`,
    opportunity_score: opportunityScore,
  };
}

/**
 * Fallback scoring algorithm
 */
function calculateFallbackScore(lead: Partial<Lead>, enrichmentData: Partial<EnrichmentResult>): number {
  let score = 50; // Base score

  // Rating factor (lower rating = more opportunity)
  if (lead.rating) {
    if (lead.rating < 3.5) score += 20;
    else if (lead.rating < 4.0) score += 10;
    else if (lead.rating >= 4.5) score -= 10;
  }

  // Website factor
  if (!lead.website) score += 15;
  else if (enrichmentData.website_score && enrichmentData.website_score < 50) score += 10;
  else if (enrichmentData.website_score && enrichmentData.website_score < 70) score += 5;

  // Social presence factor
  if (enrichmentData.social_presence === 'none') score += 15;
  else if (enrichmentData.social_presence === 'low') score += 10;
  else if (enrichmentData.social_presence === 'medium') score += 5;

  // Ad presence factor (no ads = opportunity)
  if (!enrichmentData.ad_presence) score += 10;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Main enrichment function
 */
export async function enrichLead(leadId: string, lead: Lead): Promise<void> {
  try {
    console.log(`\n🔍 Enriching lead: ${lead.business_name}`);

    // Step 1: Analyze website
    const websiteAnalysis = await analyzeWebsite(lead.website);
    console.log(`  ✓ Website score: ${websiteAnalysis.score}/100`);

    // Step 2: Check social presence
    const socialPresence = await checkSocialPresence(lead.business_name, lead.website);
    console.log(`  ✓ Social presence: ${socialPresence}`);

    // Step 3: Check ad presence
    const adPresence = await checkAdPresence(lead.business_name, lead.location);
    console.log(`  ✓ Ad presence: ${adPresence ? 'Yes' : 'No'}`);

    // Step 4: Discover email
    const email = await discoverEmail(lead.website, lead.business_name);
    if (email) console.log(`  ✓ Email discovered: ${email}`);

    // Step 5: Generate AI insights
    const aiInsights = await generateAIInsights(lead, {
      website_score: websiteAnalysis.score,
      social_presence: socialPresence,
      ad_presence: adPresence,
    });
    console.log(`  ✓ Opportunity score: ${aiInsights.opportunity_score}/100`);

    // Step 6: Update lead in database
    await updateLead(leadId, {
      website_score: websiteAnalysis.score,
      social_presence: socialPresence,
      ad_presence: adPresence,
      email: email || lead.email,
      pain_points: aiInsights.pain_points,
      recommended_services: aiInsights.recommended_services,
      ai_summary: aiInsights.ai_summary,
      opportunity_score: aiInsights.opportunity_score,
      enriched_at: new Date().toISOString(),
      scored_at: new Date().toISOString(),
    });

    console.log(`✅ Lead enriched successfully\n`);
  } catch (error) {
    console.error(`❌ Error enriching lead ${leadId}:`, error);
    throw error;
  }
}

/**
 * Enrich multiple leads in batch
 */
export async function enrichLeadsBatch(leads: Lead[]): Promise<void> {
  console.log(`🚀 Starting batch enrichment for ${leads.length} leads...\n`);

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    try {
      console.log(`[${i + 1}/${leads.length}] Processing: ${lead.business_name}`);
      await enrichLead(lead.id, lead);

      // Rate limiting: wait 2 seconds between enrichments
      if (i < leads.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to enrich ${lead.business_name}:`, error);
      // Continue with next lead
    }
  }

  console.log(`\n✨ Batch enrichment complete!`);
}
