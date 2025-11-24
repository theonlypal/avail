/**
 * LIVE CALL TEST WITH REAL-TIME TRANSCRIPTION
 *
 * This script:
 * 1. Initiates a real Twilio call to YOUR phone
 * 2. Monitors transcripts in real-time as you speak
 * 3. Shows transcriptions appearing live in the terminal
 *
 * YOU WILL RECEIVE A CALL - Answer it and start talking!
 */

import { sql } from '@vercel/postgres';

const PHONE_NUMBER = '+16263947645'; // Your phone number
const PRODUCTION_URL = 'https://avail-production.up.railway.app';

async function testLiveCall() {
  console.log('\n🎤 LIVE TRANSCRIPTION TEST\n');
  console.log('='.repeat(80));
  console.log('\n📞 Step 1: Initiating call to', PHONE_NUMBER);
  console.log('   You will receive a call in a few seconds...\n');

  try {
    // Initiate the call
    const response = await fetch(`${PRODUCTION_URL}/api/calls/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: 'live-test-' + Date.now(),
        to_number: PHONE_NUMBER,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Call failed: ${error}`);
    }

    const data = await response.json();
    const callSid = data.call_sid;

    console.log('✅ Call initiated successfully!');
    console.log(`   Call SID: ${callSid}`);
    console.log('\n📱 ANSWER YOUR PHONE NOW!\n');
    console.log('='.repeat(80));
    console.log('\n💬 Listening for transcripts (speak into your phone)...\n');

    // Monitor transcripts in real-time
    let lastTranscriptCount = 0;
    const startTime = Date.now();
    const maxDuration = 120000; // 2 minutes max

    while (Date.now() - startTime < maxDuration) {
      // Wait 2 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch transcripts from database
      const transcripts = await sql`
        SELECT speaker, text, timestamp, confidence, created_at
        FROM live_transcripts
        WHERE call_sid = ${callSid}
        ORDER BY timestamp ASC
      `;

      // Show new transcripts
      if (transcripts.rows.length > lastTranscriptCount) {
        const newTranscripts = transcripts.rows.slice(lastTranscriptCount);

        newTranscripts.forEach((t: any) => {
          const speaker = t.speaker === 'Agent' ? '🤖 AI' : '👤 YOU';
          const confidence = (t.confidence * 100).toFixed(0);
          console.log(`${speaker}: ${t.text} [${confidence}% confidence]`);
        });

        lastTranscriptCount = transcripts.rows.length;
      }

      // Check if call is still active (if transcripts stopped coming for 10s, call might be over)
      if (transcripts.rows.length > 0) {
        const lastTranscript = transcripts.rows[transcripts.rows.length - 1];
        const timeSinceLastTranscript = Date.now() - new Date(lastTranscript.created_at).getTime();

        if (timeSinceLastTranscript > 15000 && lastTranscriptCount > 0) {
          console.log('\n⏰ No new transcripts for 15 seconds - call likely ended\n');
          break;
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TEST COMPLETE!');
    console.log(`   Total transcripts captured: ${lastTranscriptCount}`);
    console.log('\n📊 View all transcripts:');
    console.log(`   curl "${PRODUCTION_URL}/api/calls/stream?callSid=${callSid}"`);
    console.log('\n' + '='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetails:', error);
  }
}

console.log('\n⚠️  IMPORTANT: Make sure you can receive calls at', PHONE_NUMBER);
console.log('   The call will start in 5 seconds...\n');

setTimeout(() => {
  testLiveCall();
}, 5000);
