import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/demos
 * Returns list of all available demos with metadata
 */
export async function GET() {
  try {
    const demosDirectory = path.join(process.cwd(), 'public', 'demos');
    const demoFiles = [
      'crm-demo.json',
      'website-demo.json',
      'sms-demo.json',
      'reviews-demo.json',
      'social-demo.json',
      'ads-demo.json'
    ];

    const demos = demoFiles.map((filename) => {
      const filePath = path.join(demosDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const demo = JSON.parse(fileContents);

      // Return summary info for the gallery
      return {
        id: demo.id,
        title: demo.title,
        subtitle: demo.subtitle,
        description: demo.description,
        icon: demo.icon,
        color: demo.color,
        features: demo.features.slice(0, 3), // Top 3 features for preview
      };
    });

    return NextResponse.json({ demos });
  } catch (error) {
    console.error('Error loading demos:', error);
    return NextResponse.json(
      { error: 'Failed to load demos' },
      { status: 500 }
    );
  }
}
