/**
 * Prospects API
 *
 * Handles prospect creation from intake forms and listing.
 * Creates personalized demo links for each prospect.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createProspect,
  listProspects,
  getProspectByEmail,
  type Prospect
} from '@/lib/db-prospects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const prospects = await listProspects({ status, limit, offset });

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length,
    });
  } catch (error) {
    console.error('Failed to list prospects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list prospects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['company_name', 'contact_name', 'contact_email', 'industry', 'business_type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if prospect already exists
    const existing = await getProspectByEmail(body.contact_email);
    if (existing) {
      return NextResponse.json({
        success: true,
        prospect: existing,
        message: 'Prospect already exists',
        demo_url: `/demos?prospect=${existing.demo_token}`,
      });
    }

    // Create new prospect
    const prospect = await createProspect({
      company_name: body.company_name,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      industry: body.industry,
      business_type: body.business_type,
      location: body.location,
      team_id: body.team_id,
      services: body.services,
      pain_points: body.pain_points,
      current_tools: body.current_tools,
      monthly_leads: body.monthly_leads,
      avg_deal_value: body.avg_deal_value,
      website_url: body.website_url,
      google_business_url: body.google_business_url,
      social_handles: body.social_handles,
      demo_preferences: body.demo_preferences,
      status: 'new',
      source: body.source || 'intake_form',
      notes: body.notes,
    });

    // Generate demo URL
    const demoUrl = `/demos?prospect=${prospect.demo_token}`;

    return NextResponse.json({
      success: true,
      prospect,
      demo_url: demoUrl,
      message: 'Prospect created successfully',
    });
  } catch (error) {
    console.error('Failed to create prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prospect' },
      { status: 500 }
    );
  }
}
