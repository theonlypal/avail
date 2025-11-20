/**
 * API Route for AI-powered lead discovery
 * POST /api/leads/discover - Discover and save new leads
 */

import { NextRequest, NextResponse } from 'next/server';
import { discoverLeads, type DiscoveryQuery } from '@/lib/ai-lead-discovery-v2';
import { createLead } from '@/lib/leads-sqlite';
import { enrichLead } from '@/lib/lead-enrichment-v2';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Vercel

/**
 * POST /api/leads/discover
 * Body: DiscoveryQuery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.industry || !body.location) {
      return NextResponse.json(
        { error: 'Industry and location are required' },
        { status: 400 }
      );
    }

    const query: DiscoveryQuery = {
      industry: body.industry,
      location: body.location,
      minRating: body.minRating,
      targetCriteria: body.targetCriteria,
      maxResults: body.maxResults || 20,
    };

    console.log('🚀 Starting lead discovery...');
    console.log('Query:', query);

    // Step 1: Discover leads using AI
    const discoveredLeads = await discoverLeads(query);

    if (discoveredLeads.length === 0) {
      return NextResponse.json({
        success: true,
        discovered: 0,
        created: 0,
        enriched: 0,
        leads: [],
        message: 'No leads found matching the criteria',
      });
    }

    console.log(`✅ Discovered ${discoveredLeads.length} leads`);

    // Step 2: Save leads to database
    const createdLeads = [];
    const errors = [];

    for (const discoveredLead of discoveredLeads) {
      try {
        const newLead = await createLead({
          business_name: discoveredLead.business_name,
          industry: discoveredLead.industry,
          location: discoveredLead.location,
          phone: discoveredLead.phone || null,
          email: discoveredLead.email || null,
          website: discoveredLead.website || null,
          rating: discoveredLead.rating || null,
          review_count: discoveredLead.review_count || 0,
          website_score: 0,
          social_presence: 'unknown',
          ad_presence: false,
          opportunity_score: 0,
          pain_points: [],
          recommended_services: [],
          ai_summary: null,
          lat: discoveredLead.lat || null,
          lng: discoveredLead.lng || null,
          added_by: 'ai_discovery',
          source: discoveredLead.source,
        });

        createdLeads.push(newLead);
      } catch (error: any) {
        console.error(`Failed to create lead ${discoveredLead.business_name}:`, error);
        errors.push({
          business_name: discoveredLead.business_name,
          error: error.message,
        });
      }
    }

    console.log(`✅ Created ${createdLeads.length} leads in database`);

    // Step 3: Enrich leads (in background for first few)
    const enrichmentCount = Math.min(5, createdLeads.length); // Limit to 5 for initial enrichment
    const enrichedLeads = [];

    for (let i = 0; i < enrichmentCount; i++) {
      const lead = createdLeads[i];
      try {
        await enrichLead(lead.id, lead);
        enrichedLeads.push(lead);
      } catch (error) {
        console.error(`Failed to enrich lead ${lead.id}:`, error);
      }
    }

    console.log(`✅ Enriched ${enrichedLeads.length} leads`);

    return NextResponse.json({
      success: true,
      discovered: discoveredLeads.length,
      created: createdLeads.length,
      enriched: enrichedLeads.length,
      leads: createdLeads,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully discovered and created ${createdLeads.length} leads. ${enrichedLeads.length} leads enriched immediately.`,
    });
  } catch (error: any) {
    console.error('Error in lead discovery:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover leads',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
