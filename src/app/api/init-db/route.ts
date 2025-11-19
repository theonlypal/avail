/**
 * Database initialization endpoint
 * Call this once after deploying to set up Postgres schema
 */

import { NextResponse } from 'next/server';
import { initializePostgresSchema } from '@/lib/db';

export async function GET() {
  try {
    if (process.env.VERCEL !== '1') {
      return NextResponse.json({
        error: 'This endpoint only works in production (Vercel)',
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
