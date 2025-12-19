/**
 * Custom Next.js server with WebSocket support for real-time transcription
 * This enables Twilio Media Streams to connect via WebSocket and use Deepgram
 * IMPORTANT: This MUST run with `node server.js` not `next start`
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const { neon } = require('@neondatabase/serverless');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

// Detect production environment
const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = IS_PRODUCTION && postgresUrl ? neon(postgresUrl) : null;

// Database helper - PostgreSQL only (production)
async function insertTranscript(callSid, speaker, text, timestamp, confidence) {
  try {
    if (!sql) {
      console.warn('[DB] No database configured - skipping transcript storage');
      return;
    }

    await sql`
      INSERT INTO live_transcripts (call_sid, speaker, text, timestamp, confidence)
      VALUES (${callSid}, ${speaker}, ${text}, ${timestamp}, ${confidence || 0.99})
    `;
    console.log(`[DB] Stored transcript for call ${callSid}: [${speaker}] ${text.substring(0, 50)}...`);
  } catch (error) {
    console.error('[DB] Failed to store transcript:', error);
  }
}

function initializeWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/api/calls/stream'
  });

  console.log('[WebSocket] Server initialized on path /api/calls/stream');

  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

  wss.on('connection', (ws) => {
    console.log('[WebSocket] New connection established');

    let callSid = null;
    let deepgramConnection = null;
    let mediaPacketCount = 0;

    ws.on('message', async (message) => {
      try {
        const rawMessage = message.toString();
        const data = JSON.parse(rawMessage);

        // Only log non-media events (media events are too frequent and clog logs)
        if (data.event !== 'media') {
          console.log('[WebSocket] Received event:', data.event, '| Data:', JSON.stringify(data).substring(0, 200));
        }

        switch (data.event) {
          case 'connected':
            console.log('[WebSocket] Twilio connected. StreamSid:', data.streamSid);
            break;

          case 'start':
            callSid = data.start.callSid;
            console.log('[WebSocket] Stream started for call:', callSid);

            // Initialize Deepgram connection
            console.log('[Deepgram] Checking API key configuration...');
            console.log('[Deepgram] API key exists:', !!DEEPGRAM_API_KEY);
            console.log('[Deepgram] API key length:', DEEPGRAM_API_KEY ? DEEPGRAM_API_KEY.length : 0);

            if (!DEEPGRAM_API_KEY) {
              console.error('[Deepgram] API key not configured');
              ws.send(JSON.stringify({ error: 'Deepgram API key missing' }));
              return;
            }

            try {
              console.log('[Deepgram] Creating Deepgram client...');
              const deepgram = createClient(DEEPGRAM_API_KEY);
              console.log('[Deepgram] Client created successfully');

              console.log('[Deepgram] Opening live transcription connection...');
              deepgramConnection = deepgram.listen.live({
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                diarize: true, // AI-powered speaker separation - critical for identifying Lead vs Agent
                punctuate: true,
                interim_results: true, // Enable streaming partial transcripts for real-time updates (sub-second latency)
                encoding: 'mulaw',
                sample_rate: 8000,
                channels: 1, // Mono: Twilio's both_tracks sends MIXED mono, not true stereo. Use diarization to separate speakers.
              });
              console.log('[Deepgram] Live connection opened successfully');
            } catch (deepgramError) {
              console.error('[Deepgram] INITIALIZATION ERROR:', deepgramError);
              console.error('[Deepgram] Error message:', deepgramError.message);
              console.error('[Deepgram] Error stack:', deepgramError.stack);
              ws.send(JSON.stringify({ error: 'Deepgram initialization failed', details: deepgramError.message }));
              return;
            }

            // Handle Deepgram transcription results
            deepgramConnection.on(LiveTranscriptionEvents.Transcript, async (transcriptData) => {
              const transcript = transcriptData.channel?.alternatives?.[0];

              if (!transcript?.transcript) {
                return; // Skip empty transcripts (silence)
              }

              // CRITICAL: With track="both_tracks", Twilio sends MIXED MONO audio with BOTH speakers
              // Deepgram's diarization AI separates speakers by voice characteristics
              // Speaker detection: Usually speaker 0 = Lead (answers first), speaker 1 = Agent (calls)
              // If diarization provides speaker info in words, use it. Otherwise default to "Lead"
              let speakerLabel = 'Lead'; // Default to Lead

              if (transcript.words && transcript.words.length > 0) {
                // Use diarization speaker from the first word
                const firstSpeaker = transcript.words[0].speaker;
                if (firstSpeaker !== undefined) {
                  // Map Deepgram's speaker numbers to our labels
                  // Typically speaker 0 = person who speaks first (Lead)
                  // speaker 1 = second person (Agent/Web User)
                  speakerLabel = firstSpeaker === 0 ? 'Lead' : 'Agent';
                }
              }

              const confidence = transcript.confidence || 0;
              console.log(`[Deepgram] [${speakerLabel}] ${transcript.transcript} (${confidence.toFixed(2)})`);

              // Store in database with proper speaker identification
              await insertTranscript(callSid, speakerLabel, transcript.transcript, Date.now(), confidence);
            });

            deepgramConnection.on(LiveTranscriptionEvents.Error, (error) => {
              console.error('[Deepgram] ERROR EVENT:', error);
            });

            deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
              console.log('[Deepgram] CONNECTION OPENED - Ready to receive audio');
            });

            deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
              console.log('[Deepgram] CONNECTION CLOSED');
            });

            deepgramConnection.on(LiveTranscriptionEvents.Metadata, (metadata) => {
              console.log('[Deepgram] METADATA:', JSON.stringify(metadata, null, 2));
            });

            deepgramConnection.on(LiveTranscriptionEvents.Warning, (warning) => {
              console.warn('[Deepgram] WARNING:', warning);
            });

            break;

          case 'media':
            if (!deepgramConnection || !data.media?.payload) {
              return;
            }

            // Decode base64 audio and send to Deepgram
            const audioBuffer = Buffer.from(data.media.payload, 'base64');
            deepgramConnection.send(audioBuffer);

            // Log every 100th media packet for monitoring (reduces log spam)
            mediaPacketCount++;
            if (mediaPacketCount % 100 === 0) {
              console.log(`[WebSocket] Processed ${mediaPacketCount} media packets for call ${callSid}`);
            }
            break;

          case 'stop':
            console.log('[WebSocket] Stream stopped for call:', callSid);
            if (deepgramConnection) {
              deepgramConnection.finish();
            }
            break;
        }
      } catch (error) {
        console.error('[WebSocket] Message handling error:', error);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Connection closed for call:', callSid);
      if (deepgramConnection) {
        deepgramConnection.finish();
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });
  });

  return wss;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize WebSocket server
  console.log('[Server] Initializing WebSocket server...');
  initializeWebSocketServer(server);
  console.log('[Server] WebSocket server ready for Twilio Media Streams');

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket ready on ws://${hostname}:${port}/api/calls/stream`);
  });
});
