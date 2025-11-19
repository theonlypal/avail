import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/demos/[demoId]
 * Returns full demo data for a specific demo
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ demoId: string }> }
) {
  try {
    const { demoId } = await params;
    const demosDirectory = path.join(process.cwd(), 'public', 'demos');
    const filePath = path.join(demosDirectory, `${demoId}-demo.json`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Demo not found' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const demo = JSON.parse(fileContents);

    return NextResponse.json({ demo });
  } catch (error) {
    console.error('Error loading demo:', error);
    return NextResponse.json(
      { error: 'Failed to load demo' },
      { status: 500 }
    );
  }
}
