/**
 * Lead Verification API
 * Verifies leads are real businesses using Perplexity AI
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for bulk verification

async function verifyBusinessWithPerplexity(business: any): Promise<any> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return performBasicVerification(business);
  }

  try {
    const verificationPrompt = `Verify if "${business.business_name}" in ${business.location} is a real, legitimate business.

Business details:
- Name: ${business.business_name}
- Phone: ${business.phone || 'unknown'}
- Website: ${business.website || 'none'}
- Location: ${business.location}

Check:
1. Does this business actually exist?
2. Is the phone number valid?
3. Is the website legitimate (if provided)?
4. Can you find this business on Google, Yelp, or directories?
5. Any red flags?

Respond with JSON:
{
  "verified": true/false,
  "confidence": 0-100,
  "exists": true/false,
  "phone_valid": true/false,
  "website_valid": true/false,
  "found_online": true/false,
  "sources": ["list of sources"],
  "notes": "verification summary",
  "red_flags": []
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business verification assistant. Check if businesses are real using web search. Always return valid JSON.',
          },
          {
            role: 'user',
            content: verificationPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return performBasicVerification(business);
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return performBasicVerification(business);
    }

    const verification = JSON.parse(jsonMatch[0]);

    return {
      verified: verification.verified || false,
      confidence: verification.confidence || 0,
      notes: verification.notes || 'Verification completed',
      sources: verification.sources || [],
      red_flags: verification.red_flags || [],
    };

  } catch (error) {
    console.error('Verification error:', error);
    return performBasicVerification(business);
  }
}

function performBasicVerification(business: any): any {
  let confidence = 50;
  const checks: string[] = [];

  if (business.phone) {
    confidence += 15;
    checks.push('phone');
  }
  if (business.website) {
    confidence += 15;
    checks.push('website');
  }
  if (business.location) {
    confidence += 10;
    checks.push('location');
  }

  return {
    verified: confidence >= 70,
    confidence: Math.min(confidence, 85),
    notes: `Basic verification (${checks.join(', ')})`,
    sources: ['basic_validation'],
    red_flags: [],
  };
}

/**
 * POST /api/leads/verify - Verify specific leads or all leads
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadIds, filterByScore, minScore } = body;

    const db = getDb();

    let leads: any[] = [];

    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      // Verify specific leads
      const placeholders = leadIds.map(() => '?').join(',');
      leads = db.prepare(`
        SELECT id, business_name, phone, website, location, opportunity_score
        FROM leads
        WHERE id IN (${placeholders})
      `).all(...leadIds);
    } else if (filterByScore && minScore !== undefined) {
      // Verify leads above a certain score
      leads = db.prepare(`
        SELECT id, business_name, phone, website, location, opportunity_score
        FROM leads
        WHERE opportunity_score >= ?
        ORDER BY opportunity_score DESC
      `).all(minScore);
    } else {
      // Verify all leads
      leads = db.prepare(`
        SELECT id, business_name, phone, website, location, opportunity_score
        FROM leads
      `).all();
    }

    console.log(`🔍 Verifying ${leads.length} leads...`);

    const updateStmt = db.prepare(`
      UPDATE leads
      SET verified = ?, verification_notes = ?, verification_date = ?
      WHERE id = ?
    `);

    let verified = 0;
    let failed = 0;
    const results: any[] = [];

    for (const lead of leads) {
      try {
        const verification = await verifyBusinessWithPerplexity(lead);

        updateStmt.run(
          verification.verified ? 1 : 0,
          JSON.stringify({
            confidence: verification.confidence,
            notes: verification.notes,
            sources: verification.sources,
            red_flags: verification.red_flags,
          }),
          new Date().toISOString(),
          lead.id
        );

        results.push({
          id: lead.id,
          business_name: lead.business_name,
          verified: verification.verified,
          confidence: verification.confidence,
          notes: verification.notes,
        });

        if (verification.verified) {
          verified++;
        } else {
          failed++;
        }

        console.log(`✅ ${lead.business_name}: ${verification.verified ? 'VERIFIED' : 'FAILED'} (${verification.confidence}% confidence)`);

        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error verifying ${lead.business_name}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verified ${leads.length} leads`,
      verified,
      failed,
      results,
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      {
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/verify - Get verification status
 */
export async function GET() {
  try {
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN verified = 0 AND verification_date IS NOT NULL THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN verification_date IS NULL THEN 1 ELSE 0 END) as pending
      FROM leads
    `).get();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Verification stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get verification stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
