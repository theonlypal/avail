/**
 * Create live_transcripts table in production database
 * This ensures the table exists BEFORE any calls are made
 */

import { Client } from 'pg';

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not set');
  process.exit(1);
}

async function createLiveTranscriptsTable() {
  const client = new Client({
    connectionString: POSTGRES_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');

    console.log('📝 Creating live_transcripts table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS live_transcripts (
        call_sid TEXT NOT NULL,
        speaker TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        confidence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (call_sid, timestamp)
      )
    `);

    console.log('✅ live_transcripts table created successfully');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_live_transcripts_call_sid
      ON live_transcripts(call_sid)
    `);

    console.log('✅ Index created');

    // Verify table exists
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'live_transcripts'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Table structure:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ All done!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createLiveTranscriptsTable();
