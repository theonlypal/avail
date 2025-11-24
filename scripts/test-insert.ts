/**
 * Test INSERT to see exact error
 */

import { neon } from '@neondatabase/serverless';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable not set');
  process.exit(1);
}

const sql = neon(POSTGRES_URL);

async function testInsert() {
  console.log('[Test] Testing INSERT with current schema...\n');

  try {
    // Get a team first
    const teams = await sql`SELECT id FROM teams LIMIT 1`;
    if (teams.length === 0) {
      console.error('[Test] No teams found!');
      process.exit(1);
    }
    const teamId = teams[0].id;
    console.log(`[Test] Using team ID: ${teamId}`);

    // Try to insert a test lead with the EXACT same format as the code
    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();

    console.log('[Test] Attempting INSERT...');

    await sql`
      INSERT INTO leads (
        id, team_id, business_name, industry, location, phone, email, website,
        rating, review_count, opportunity_score, pain_points, created_at
      ) VALUES (
        ${leadId},
        ${teamId},
        ${'Test Indian Restaurant'},
        ${'indian restaurant'},
        ${'San Diego, CA'},
        ${'+16195551234'},
        ${null},
        ${'https://test.com'},
        ${4.5},
        ${100},
        ${85},
        ${JSON.stringify(['Low online presence', 'No booking system'])},
        ${now}
      )
    `;

    console.log('[Test] ✅ INSERT successful!');
    console.log(`[Test] Inserted lead ID: ${leadId}`);

    // Verify it was inserted
    const inserted = await sql`SELECT * FROM leads WHERE id = ${leadId}`;
    console.log('[Test] Verified:', inserted[0]);

    // Clean up
    await sql`DELETE FROM leads WHERE id = ${leadId}`;
    console.log('[Test] Cleaned up test lead');

  } catch (error: any) {
    console.error('[Test] ❌ INSERT failed:',error);
    console.error('[Test] Error code:', error.code);
    console.error('[Test] Error detail:', error.detail);
    process.exit(1);
  }
}

testInsert();
