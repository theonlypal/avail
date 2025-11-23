# WebSocket Live Transcription Deployment Guide

## What Was Fixed

### The Problem
The live transcription system wasn't working because:
1. **WebSocket Server Missing**: Twilio Media Streams requires a WebSocket server, but the `/api/calls/stream` endpoint was HTTP-only
2. **Architecture Mismatch**: Next.js API routes don't support WebSocket connections natively
3. **Missing API Keys**: DEEPGRAM_API_KEY likely not configured in production

### The Solution
Created a custom Next.js server (`server.js`) with WebSocket support:
- ✅ Proper WebSocket server at `/api/calls/stream` path
- ✅ Integrates Deepgram for real-time speech-to-text
- ✅ Stores transcripts in `live_transcripts` table
- ✅ Frontend polls and displays transcripts in real-time

## Required Environment Variables

Add these to Railway/Vercel production environment:

```bash
# CRITICAL - Required for transcription
DEEPGRAM_API_KEY=your_deepgram_api_key

# Already configured
POSTGRES_URL=postgresql://...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
ANTHROPIC_API_KEY=...
GOOGLE_PLACES_API_KEY=...
```

## Getting Deepgram API Key

1. Go to https://deepgram.com/
2. Sign up for a free account ($200 credit)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add to Railway:

```bash
railway variables set DEEPGRAM_API_KEY=your_key_here
```

## Deployment Steps

### Railway (Recommended)

1. **Push changes to Git:**
   ```bash
   git add server.js railway.json package.json
   git commit -m "feat: add WebSocket server for live transcription"
   git push
   ```

2. **Railway will automatically:**
   - Detect the new `railway.json` configuration
   - Run `npm run build`
   - Start the server with `node server.js`
   - WebSocket will be available at `wss://your-app.railway.app/api/calls/stream`

3. **Add DEEPGRAM_API_KEY:**
   ```bash
   railway variables set DEEPGRAM_API_KEY=your_key_here
   ```

4. **Verify deployment:**
   ```bash
   curl -X POST https://your-app.railway.app/api/calls/initiate \
     -H "Content-Type: application/json" \
     -d '{"lead_id":"test-ws","to_number":"+16263947645"}'
   ```

### Vercel (Alternative)

Note: Vercel has limitations with WebSockets. Use Railway for production.

If you must use Vercel:
1. Deploy normally: `vercel --prod`
2. WebSockets may not work due to Vercel's serverless architecture
3. Consider using Vercel for frontend + Railway for WebSocket server

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks "Call Lead" button                          │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. POST /api/calls/initiate                                │
│     - Creates Twilio call                                   │
│     - Twilio URL: /api/calls/twiml                          │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. GET /api/calls/twiml                                    │
│     - Returns TwiML with <Stream> tag                       │
│     - Stream URL: wss://app/api/calls/stream                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. WebSocket Connection (NEW!)                             │
│     - Twilio connects to WebSocket                          │
│     - Streams real-time audio chunks                        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Deepgram Transcription                                  │
│     - Receives audio chunks from Twilio                     │
│     - Transcribes with speaker diarization                  │
│     - Returns: { speaker: "Agent", text: "...", confidence }│
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Database Storage                                        │
│     - INSERT INTO live_transcripts (call_sid, speaker, ...) │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Frontend Display (UnifiedCallView)                      │
│     - Polls GET /api/calls/stream?callSid=xxx every 500ms   │
│     - Displays purple bubbles (call audio)                  │
│     - Updates in real-time                                  │
└─────────────────────────────────────────────────────────────┘
```

## Testing

### 1. Check WebSocket Server is Running

```bash
curl https://your-app.railway.app/
# Should return your app's homepage
```

### 2. Initiate a Test Call

```bash
curl -X POST https://your-app.railway.app/api/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"test-transcription","to_number":"+YOUR_PHONE_NUMBER"}'
```

### 3. Monitor Logs

```bash
railway logs
```

Look for:
```
[WebSocket] Server initialized on path /api/calls/stream
[WebSocket] New connection established
[WebSocket] Stream started for call: CAxxxx
[Deepgram] [Agent] Hello, how can I help you? (0.95)
[Deepgram] [Lead] Hi, I'm calling about... (0.92)
```

### 4. Check Database

```bash
npx tsx scripts/test-transcription-flow.ts
```

### 5. View in UI

1. Open https://your-app.railway.app/test-dialer
2. Click "Call Lead" button
3. Answer the call on your phone
4. Speak and watch purple bubbles appear in real-time

## Troubleshooting

### No transcripts appearing

**Check 1: Is WebSocket server running?**
```bash
railway logs | grep WebSocket
# Should see: [WebSocket] Server initialized
```

**Check 2: Is Deepgram API key configured?**
```bash
railway variables list | grep DEEPGRAM
# Should see: DEEPGRAM_API_KEY=xxxx
```

**Check 3: Is Twilio connecting?**
```bash
railway logs | grep "Stream started"
# Should see: [WebSocket] Stream started for call: CAxxxx
```

**Check 4: Is database receiving data?**
```bash
npx tsx scripts/test-transcription-flow.ts
```

### WebSocket connection fails

- Verify Railway deployment is using `node server.js` (not `next start`)
- Check railway.json is present and configured correctly
- Ensure PORT environment variable is set by Railway

### Deepgram errors

- Check API key is valid: https://console.deepgram.com/
- Verify you have credits remaining
- Check Deepgram status: https://status.deepgram.com/

## Architecture Notes

### Why Custom Server?

Next.js API routes are serverless functions that:
- ❌ Cannot maintain WebSocket connections
- ❌ Timeout after 10 seconds
- ❌ Don't support bidirectional communication

Custom Node.js server:
- ✅ Maintains persistent WebSocket connections
- ✅ No timeout limits
- ✅ Supports Twilio Media Streams protocol

### Files Changed

1. **server.js** (NEW) - Custom Next.js server with WebSocket support
2. **package.json** - Updated scripts to use custom server
3. **railway.json** (NEW) - Railway deployment configuration

### Files NOT Changed

- `/src/app/api/calls/stream/route.ts` - Keep for GET endpoint (frontend polling)
- `/src/components/unified-call-view.tsx` - Already working correctly
- `/scripts/test-transcription-flow.ts` - Already working correctly

## Next Steps

After deployment:

1. ✅ Configure DEEPGRAM_API_KEY
2. ✅ Test with real phone call
3. ✅ Monitor logs for any errors
4. ⚠️  Optional: Configure ASSEMBLY_AI_API_KEY for microphone transcription
5. ⚠️  Optional: Add error monitoring (Sentry, LogRocket, etc.)

## Success Criteria

You'll know it's working when:

1. ✅ Railway logs show `[WebSocket] Server initialized`
2. ✅ After initiating call, logs show `[WebSocket] Stream started for call: CAxxxx`
3. ✅ Deepgram logs show `[Deepgram] [Agent] ...` and `[Deepgram] [Lead] ...`
4. ✅ Purple bubbles appear in UnifiedCallView during call
5. ✅ Transcripts persist after call ends

## Support

If issues persist:
1. Check Railway logs: `railway logs --tail 100`
2. Test database: `npx tsx scripts/test-transcription-flow.ts`
3. Verify API keys are configured correctly
4. Check Twilio webhook logs in Twilio Console
