/**
 * Check available transcripts in production
 */

import { sql } from '@vercel/postgres';

async function checkTranscripts() {
  const calls = await sql`
    SELECT call_sid, COUNT(*) as transcript_count, MAX(created_at) as last_created
    FROM live_transcripts
    GROUP BY call_sid
    ORDER BY last_created DESC
  `;

  console.log('\n💬 Available Test Transcripts:\n');
  console.log('='.repeat(80));

  if (calls.rows.length === 0) {
    console.log('❌ NO TRANSCRIPTS AVAILABLE');
  } else {
    calls.rows.forEach((call: any, idx: number) => {
      console.log(`\n${idx + 1}. Call SID: ${call.call_sid}`);
      console.log(`   Transcripts: ${call.transcript_count} messages`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📍 TO TEST TRANSCRIPTION ON PRODUCTION:');
  if (calls.rows.length > 0) {
    const callSid = calls.rows[0].call_sid;
    console.log(`\n1. Visit: https://avail-production.up.railway.app/test-dialer`);
    console.log(`2. When initiating a call, the component will use callSid: ${callSid}`);
    console.log(`\n3. Or test the API directly:`);
    console.log(`   curl "https://avail-production.up.railway.app/api/calls/stream?callSid=${callSid}"`);
  }
}

checkTranscripts();
