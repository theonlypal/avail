/**
 * ASSEMBLYAI UNIVERSAL-STREAMING TRANSCRIPTION ENDPOINT
 *
 * Returns API key for secure browser-to-AssemblyAI WebSocket connections
 * Target latency: 307ms (P50) for immutable transcripts
 *
 * Flow:
 * 1. Client requests connection info
 * 2. Server returns API key (or temporary token)
 * 3. Client connects to wss://streaming.assemblyai.com/v3/ws
 * 4. Transcripts stream with 307ms latency
 *
 * Note: Using direct API key for now. For production, implement temporary token generation.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Get connection info for AssemblyAI Universal-Streaming
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AssemblyAI API key not configured',
          setup: 'Get free API key from https://www.assemblyai.com/dashboard/signup',
        },
        { status: 500 }
      );
    }

    // For Universal-Streaming, we can directly use the API key
    // The new v3 WebSocket endpoint doesn't require a separate token endpoint
    return NextResponse.json({
      api_key: apiKey.trim(), // Client will use this directly with WebSocket (trim any whitespace)
      websocket_url: 'wss://streaming.assemblyai.com/v3/ws',
      sample_rate: 16000,
    });
  } catch (error) {
    console.error('[AssemblyAI] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize transcription service' },
      { status: 500 }
    );
  }
}

/**
 * Health check and configuration info
 */
export async function GET() {
  const configured = !!process.env.ASSEMBLYAI_API_KEY;

  return NextResponse.json({
    status: configured ? 'healthy' : 'unconfigured',
    service: 'AssemblyAI Universal-Streaming',
    latency: {
      p50: '307ms',
      p99: '1012ms',
    },
    features: [
      'immutable-transcripts',
      'intelligent-endpointing',
      'real-time-streaming',
      'websocket-connection',
    ],
    pricing: '$0.15/hour',
    free_tier: '$200 credits (1,333 hours)',
    configured,
  });
}
