/**
 * Automation Queue Processor API Route - PRODUCTION READY
 *
 * POST: Process pending scheduled automation actions
 * This should be called by a cron job every minute
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledActions } from '@/lib/automation-engine';

/**
 * POST /api/automations/process
 * Process pending scheduled automation actions
 *
 * Optional headers:
 *  - x-cron-secret: Secret key for cron job authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const providedSecret = request.headers.get('x-cron-secret');
      if (providedSecret !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Processing scheduled automation actions...');

    const result = await processScheduledActions();

    console.log(`✅ Automation processing complete: ${result.processed} processed, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ POST /api/automations/process error:', error);
    return NextResponse.json(
      { error: 'Failed to process automations', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/automations/process
 * Health check / status endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Automation processor is running. Use POST to process pending actions.',
    timestamp: new Date().toISOString(),
  });
}
