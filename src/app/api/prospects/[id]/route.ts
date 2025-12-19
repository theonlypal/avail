/**
 * Individual Prospect API
 *
 * Get, update, delete specific prospect
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProspectById,
  getProspectByDemoToken,
  updateProspect,
  deleteProspect,
} from '@/lib/db-prospects';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it's a demo token lookup
    const { searchParams } = new URL(request.url);
    const isToken = searchParams.get('type') === 'token';

    const prospect = isToken
      ? await getProspectByDemoToken(id)
      : await getProspectById(id);

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prospect,
    });
  } catch (error) {
    console.error('Failed to get prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get prospect' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const prospect = await updateProspect(id, body);

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prospect,
    });
  } catch (error) {
    console.error('Failed to update prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteProspect(id);

    return NextResponse.json({
      success: true,
      message: 'Prospect deleted',
    });
  } catch (error) {
    console.error('Failed to delete prospect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prospect' },
      { status: 500 }
    );
  }
}
