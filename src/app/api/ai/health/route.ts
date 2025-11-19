/**
 * AI Service Health Check Endpoint
 *
 * Validates that the Anthropic API key is configured and working
 * Returns status information for the AI Copilot sidebar
 *
 * @route GET /api/ai/health
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthResponse {
  anthropicConfigured: boolean;
  model: string;
  status: 'ready' | 'missing_key' | 'invalid_key' | 'error';
  message?: string;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const timestamp = new Date().toISOString();
  const model = 'claude-sonnet-4-5-20250929';

  // Check if API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json({
      anthropicConfigured: false,
      model,
      status: 'missing_key',
      message: 'ANTHROPIC_API_KEY not configured in environment variables',
      timestamp,
    });
  }

  // Validate API key by making a minimal request
  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    // Make a minimal request to validate the key
    // Using a very small max_tokens to minimize cost
    await anthropic.messages.create({
      model,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }],
    });

    return NextResponse.json({
      anthropicConfigured: true,
      model,
      status: 'ready',
      message: 'AI Copilot is ready',
      timestamp,
    });
  } catch (error: any) {
    // Check if it's an authentication error
    if (error?.status === 401 || error?.message?.includes('authentication')) {
      return NextResponse.json({
        anthropicConfigured: false,
        model,
        status: 'invalid_key',
        message: 'Invalid ANTHROPIC_API_KEY - please check your configuration',
        timestamp,
      });
    }

    // Other errors (network, rate limit, etc.)
    console.error('[LeadlyAI] AI health check error:', error);
    return NextResponse.json({
      anthropicConfigured: true, // Key is present
      model,
      status: 'error',
      message: error?.message || 'Unknown error occurred',
      timestamp,
    });
  }
}
