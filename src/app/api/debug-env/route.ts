import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    has_twilio_sid: !!process.env.TWILIO_ACCOUNT_SID,
    has_twilio_token: !!process.env.TWILIO_AUTH_TOKEN,
    has_twilio_phone: !!process.env.TWILIO_PHONE_NUMBER,
    has_database_url: !!process.env.DATABASE_URL,
    has_postgres_url: !!process.env.POSTGRES_URL,
    has_deepgram: !!process.env.DEEPGRAM_API_KEY,
    has_anthropic: !!process.env.ANTHROPIC_API_KEY,
    is_production: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production',
    railway_env: process.env.RAILWAY_ENVIRONMENT,
    node_env: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
}
