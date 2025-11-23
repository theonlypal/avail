/**
 * Custom Next.js server with WebSocket support
 * This enables Twilio Media Streams to connect via WebSocket
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Database helper (simplified version)
async function insertTranscript(callSid, speaker, text, timestamp, confidence) {
  // Import db dynamically
  const { db } = await import('./src/lib/db.js');
  try {
    await db.execute(
      `INSERT INTO live_transcripts (call_sid, speaker, text, timestamp, confidence)
       VALUES (?, ?, ?, ?, ?)`,
      [callSid, speaker, text, timestamp, confidence]
    );
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

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket] Received event:', data.event);

        switch (data.event) {
          case 'connected':
            console.log('[WebSocket] Twilio connected. StreamSid:', data.streamSid);
            break;

          case 'start':
            callSid = data.start.callSid;
            console.log('[WebSocket] Stream started for call:', callSid);

            // Initialize Deepgram connection
            if (!DEEPGRAM_API_KEY) {
              console.error('[Deepgram] API key not configured');
              ws.send(JSON.stringify({ error: 'Deepgram API key missing' }));
              return;
            }

            const deepgram = createClient(DEEPGRAM_API_KEY);
            deepgramConnection = deepgram.listen.live({
              model: 'nova-2',
              language: 'en-US',
              smart_format: true,
              diarize: true,
              punctuate: true,
              interim_results: true,
              encoding: 'mulaw',
              sample_rate: 8000,
              channels: 1,
            });

            // Handle Deepgram transcription results
            deepgramConnection.on(LiveTranscriptionEvents.Transcript, async (transcriptData) => {
              const transcript = transcriptData.channel?.alternatives?.[0];
              if (!transcript?.transcript) return;

              const speaker = transcriptData.channel?.speaker || 0;
              const speakerLabel = speaker === 0 ? 'Agent' : 'Lead';
              const confidence = transcript.confidence || 0;

              console.log(`[Deepgram] [${speakerLabel}] ${transcript.transcript} (${confidence.toFixed(2)})`);

              // Store in database
              await insertTranscript(callSid, speakerLabel, transcript.transcript, Date.now(), confidence);
            });

            deepgramConnection.on(LiveTranscriptionEvents.Error, (error) => {
              console.error('[Deepgram] Error:', error);
            });

            break;

          case 'media':
            if (!deepgramConnection || !data.media?.payload) {
              return;
            }

            // Decode base64 audio and send to Deepgram
            const audioBuffer = Buffer.from(data.media.payload, 'base64');
            deepgramConnection.send(audioBuffer);
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
