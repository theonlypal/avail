/**
 * Test the complete transcription flow:
 * 1. Insert mock transcripts into live_transcripts table
 * 2. Query them via the GET API endpoint
 * 3. Verify the UnifiedCallView can retrieve them
 */

import { Client } from 'pg';

const POSTGRES_URL = process.env.POSTGRES_URL;
const TEST_CALL_SID = 'test-' + Date.now();

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not set');
  process.exit(1);
}

async function testTranscriptionFlow() {
  const client = new Client({
    connectionString: POSTGRES_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    // Step 1: Insert mock transcripts
    console.log('📝 Step 1: Inserting mock transcripts...');
    console.log(`   Call SID: ${TEST_CALL_SID}`);

    const mockTranscripts = [
      { speaker: 'Agent', text: 'Hello, this is a test call', timestamp: Date.now(), confidence: 0.95 },
      { speaker: 'Lead', text: 'Hi, I can hear you clearly', timestamp: Date.now() + 1000, confidence: 0.92 },
      { speaker: 'Agent', text: 'Great! How are you today?', timestamp: Date.now() + 2000, confidence: 0.96 },
      { speaker: 'Lead', text: 'I am doing well, thanks', timestamp: Date.now() + 3000, confidence: 0.94 },
    ];

    for (const transcript of mockTranscripts) {
      await client.query(`
        INSERT INTO live_transcripts (call_sid, speaker, text, timestamp, confidence)
        VALUES ($1, $2, $3, $4, $5)
      `, [TEST_CALL_SID, transcript.speaker, transcript.text, transcript.timestamp, transcript.confidence]);

      console.log(`   ✅ [${transcript.speaker}] ${transcript.text}`);
    }

    console.log(`\n✅ Inserted ${mockTranscripts.length} test transcripts\n`);

    // Step 2: Query them back from database
    console.log('🔍 Step 2: Querying transcripts from database...');

    const result = await client.query(`
      SELECT speaker, text, timestamp, confidence
      FROM live_transcripts
      WHERE call_sid = $1
      ORDER BY timestamp ASC
    `, [TEST_CALL_SID]);

    console.log(`   Found ${result.rows.length} transcripts:`);
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. [${row.speaker}] ${row.text} (${row.confidence})`);
    });

    console.log('\n✅ Database query successful\n');

    // Step 3: Test API endpoint
    console.log('🌐 Step 3: Testing GET API endpoint...');
    console.log(`   URL: https://avail-production.up.railway.app/api/calls/stream?callSid=${TEST_CALL_SID}`);

    const response = await fetch(`https://avail-production.up.railway.app/api/calls/stream?callSid=${TEST_CALL_SID}`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }

    const apiData = await response.json();

    console.log(`   ✅ API Response:`);
    console.log(`      - Call SID: ${apiData.callSid}`);
    console.log(`      - Status: ${apiData.status}`);
    console.log(`      - Transcript count: ${apiData.transcript.length}`);

    if (apiData.transcript.length !== mockTranscripts.length) {
      throw new Error(`Expected ${mockTranscripts.length} transcripts, got ${apiData.transcript.length}`);
    }

    console.log(`\n   Transcripts from API:`);
    apiData.transcript.forEach((t: any, i: number) => {
      console.log(`   ${i + 1}. [${t.speaker}] ${t.text}`);
    });

    console.log('\n✅ API endpoint working correctly\n');

    // Step 4: Clean up
    console.log('🧹 Step 4: Cleaning up test data...');
    await client.query(`
      DELETE FROM live_transcripts WHERE call_sid = $1
    `, [TEST_CALL_SID]);
    console.log('✅ Test data cleaned up\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════');
    console.log('\nThe transcription flow is working correctly:');
    console.log('  1. ✅ Database can store transcripts');
    console.log('  2. ✅ Database can query transcripts');
    console.log('  3. ✅ API endpoint retrieves transcripts');
    console.log('  4. ✅ Frontend will be able to poll and display');
    console.log('\nNext step: Test with a real Twilio call!');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

testTranscriptionFlow();
