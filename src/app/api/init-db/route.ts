/**
 * Database initialization endpoint
 * Call this once after deploying to set up Postgres schema
 */

import { NextResponse } from 'next/server';
import { initializePostgresSchema } from '@/lib/db';

export async function GET() {
  try {
    // Allow in production environments (Vercel or Railway)
    const isProduction = process.env.VERCEL === '1' || process.env.RAILWAY_ENVIRONMENT === 'production';

    if (!isProduction && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'This endpoint only works in production (Vercel/Railway)',
      }, { status: 400 });
    }

    await initializePostgresSchema();

    return NextResponse.json({
      success: true,
      message: 'Postgres database schema initialized successfully',
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error.message,
    }, { status: 500 });
  }
}
