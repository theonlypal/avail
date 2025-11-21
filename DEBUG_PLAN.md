# 🔧 TRANSCRIPTION DEBUG PLAN - GUARANTEED FIX

## Current Status
- ✅ Code deployed to Railway
- ✅ Call initiates successfully
- ✅ AudioCapture connects to AssemblyAI
- ❌ **NO TRANSCRIPTS APPEARING IN UI**

## Root Cause Analysis Tree

### Possibility 1: AssemblyAI Not Transcribing
**Symptoms**:
- `[AudioCapture] Config response` appears
- NO `[UnifiedCallView] Mic transcript received:` logs

**Tests**:
1. Check console for `[UnifiedCallView] Mic transcript received:` after speaking
2. If missing → AssemblyAI connection issue

**Solutions**:
- Verify ASSEMBLYAI_API_KEY in Railway
- Check AssemblyAI dashboard for usage/errors
- Test locally with same API key

### Possibility 2: Transcripts Received But Not Displayed
**Symptoms**:
- `[UnifiedCallView] Mic transcript received:` appears
- `[UnifiedCallView] Adding final mic transcript to timeline:` appears
- `[UnifiedCallView] Transcript updated. Total entries: X` appears
- But NO bubbles in UI

**Tests**:
1. Check if `transcript.length` > 0 in console
2. Open React DevTools and inspect state
3. Look for rendering errors

**Solutions**:
- React state not triggering re-render
- Component not mounted properly
- CSS hiding elements

### Possibility 3: Twilio/Deepgram Not Working
**Symptoms**:
- Only microphone transcripts missing (or vice versa)
- `[UnifiedCallView] No transcripts in response` in console

**Tests**:
1. Check Railway logs: `railway logs`
2. Look for `[Deepgram] WebSocket opened`
3. Look for `[Deepgram] [Speaker 0]:`

**Solutions**:
- Twilio Media Streams not connecting
- DEEPGRAM_API_KEY invalid
- WebSocket endpoint not receiving audio

### Possibility 4: Component Not Rendering
**Symptoms**:
- Console shows transcripts updating
- But UI is blank/stuck

**Tests**:
1. Check if transcript[] state has entries
2. Look for React errors in console
3. Check if component is actually mounted

**Solutions**:
- Force re-render
- Check conditional rendering logic
- Verify component is receiving props

---

## SYSTEMATIC DEBUGGING PROTOCOL

### Phase 1: Verify Component is Actually Loaded (30 seconds)

```bash
# Step 1: Wait for Railway deploy
# Check: https://railway.app/project/<id>/deployments
# Status should be: ✅ Deployed

# Step 2: Hard refresh browser
# Press: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Step 3: Check page source
# Right-click → View Page Source
# Search for: "UnifiedCallView" or "unified-call-view"
# Expected: Should find the component in the bundle
```

### Phase 2: Verify Call Flow (1 minute)

```javascript
// In browser console, run:
localStorage.setItem('debug', 'true');

// Then start a call and check for these logs IN ORDER:
// 1. "✅ Twilio call initiated to +XXXXXXXXXXX - Call SID: CAxxxxx"
// 2. "[AudioCapture] Config response: {token: '...'}"
// 3. "[AudioCapture] Connecting to AssemblyAI..."
// 4. "[AudioCapture] WebSocket opened"
// 5. "[UnifiedCallView] Polling for transcripts. Call SID: CAxxxxx"
// 6. "[UnifiedCallView] Poll response: {callSid: '...', transcript: [...], status: '...'}"

// If ANY of these are missing, that's where the problem is
```

### Phase 3: Force Transcript Display (Test if rendering works)

```javascript
// In browser console while on call:
// This will manually add a test transcript to verify rendering works

// Get the React component instance (if using React DevTools)
// Or use this hack:
window.testTranscript = () => {
  console.log('[DEBUG] Manually adding test transcript');
  // This won't work without proper React hooks access
  // But it helps us understand if the issue is:
  // A) Transcripts not being created (data problem)
  // B) Transcripts not being displayed (rendering problem)
};
```

### Phase 4: Check Railway Backend (2 minutes)

```bash
# Step 1: Check if Deepgram is receiving audio
railway logs --filter "Deepgram" --tail 50

# Expected logs:
# [Deepgram] WebSocket opened
# [Deepgram] Connected to Deepgram
# [Deepgram] [Speaker 0]: <text>
# [Deepgram] [Speaker 1]: <text>

# If missing → Twilio Media Streams not sending audio

# Step 2: Check if transcripts are being stored
railway logs --filter "transcript" --tail 50

# Expected:
# [Deepgram] Storing transcript: {...}

# Step 3: Test stream endpoint manually
curl -s "https://avail-production.up.railway.app/api/calls/stream?callSid=<YOUR_CALL_SID>" | jq

# Expected:
# {
#   "callSid": "CAxxxxx",
#   "transcript": [
#     {"speaker": "Agent", "text": "...", "timestamp": 1234567890},
#     {"speaker": "Lead", "text": "...", "timestamp": 1234567891}
#   ],
#   "status": "active"
# }

# If transcript array is empty → Backend problem
# If transcript has data but UI doesn't show → Frontend problem
```

---

## GUARANTEED FIX SCENARIOS

### Scenario A: AssemblyAI Not Working

**Diagnosis**: No `[UnifiedCallView] Mic transcript received:` logs

**Fix**:
```bash
# 1. Verify API key
echo $ASSEMBLYAI_API_KEY  # Should not be empty

# 2. Test API key manually
curl -X POST "https://api.assemblyai.com/v2/realtime/token" \
  -H "authorization: 95901a2b922b4cbda64514701b095b66" \
  | jq

# Expected: {"token": "xxxxx"}
# If error → API key invalid

# 3. Update Railway with correct key
railway variables set ASSEMBLYAI_API_KEY=<new-key>

# 4. Redeploy
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

### Scenario B: Deepgram Not Working

**Diagnosis**: `[UnifiedCallView] No transcripts in response` in console

**Fix**:
```bash
# 1. Check Deepgram API key
railway variables | grep DEEPGRAM_API_KEY

# 2. Test Deepgram API
curl -X GET "https://api.deepgram.com/v1/projects" \
  -H "Authorization: Token 10cadc2e6f5b24b1a512b2e137ecbf6bad69efba"

# Expected: Project list
# If 401 → API key invalid

# 3. Check if Twilio is sending audio
railway logs --filter "Media stream connected" --tail 10

# If missing → Twilio Media Streams not configured

# 4. Verify TwiML has Stream tag
curl "https://avail-production.up.railway.app/api/calls/twiml"

# Expected: <Stream url="wss://avail-production.up.railway.app/api/calls/stream"/>
```

### Scenario C: UI Not Rendering Transcripts

**Diagnosis**: Console shows transcripts but UI is blank

**Fix 1: Force Re-render**:
```typescript
// Add this to unified-call-view.tsx after setTranscript:
setTranscript((prev) => {
  const updated = [...prev, entry].sort((a, b) => a.timestamp - b.timestamp);
  console.log('[FORCE RENDER] Transcript:', updated);

  // Force component to re-render
  return [...updated];  // Create new array reference
});
```

**Fix 2: Check Conditional Rendering**:
```typescript
// In unified-call-view.tsx, add debug log:
console.log('[RENDER CHECK] transcript.length:', transcript.length);
console.log('[RENDER CHECK] currentMicText:', currentMicText);
console.log('[RENDER CHECK] isCallActive:', isCallActive);

// Then check if rendering condition is met:
{transcript.length === 0 && (
  // "Waiting for conversation..." shows
)}

{transcript.map((entry, index) => (
  // Transcript bubbles should show here
  console.log('[RENDERING ENTRY]', entry)
))}
```

**Fix 3: CSS/Visibility Check**:
```javascript
// In browser console:
document.querySelectorAll('.text-cyan-400, .text-purple-400, .text-amber-400').forEach(el => {
  console.log('Found element:', el, 'visible:', el.offsetParent !== null);
});

// If elements exist but offsetParent is null → CSS hiding them
```

---

## EMERGENCY FALLBACK: Simple Test Component

If nothing works, create the simplest possible test:

```typescript
// Create /src/app/(app)/test-transcript/page.tsx
'use client';

import { useState } from 'react';

export default function TestTranscript() {
  const [items, setItems] = useState<string[]>([]);

  const addItem = () => {
    setItems(prev => [...prev, `Item ${Date.now()}`]);
    console.log('Added item. Total:', items.length + 1);
  };

  return (
    <div className="p-8">
      <button onClick={addItem} className="bg-blue-500 px-4 py-2 text-white rounded">
        Add Item (Total: {items.length})
      </button>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <p>No items yet</p>}
        {items.map((item, i) => (
          <div key={i} className="bg-gray-800 p-3 rounded text-white">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Visit `/test-transcript` and click button. If items appear → React is working, issue is with UnifiedCallView. If items don't appear → Fundamental React/Next.js problem.

---

## ACTIONABLE STEPS - DO THIS NOW

### Step 1: Wait for Deploy (2 minutes)
```bash
# Check Railway dashboard
# URL: https://railway.app/project/<id>/deployments
# Wait for: ✅ Deployed
```

### Step 2: Hard Refresh Browser (5 seconds)
```
1. Open: https://avail-production.up.railway.app/test-dialer
2. Press: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Open Console: F12
```

### Step 3: Start Call and Collect Logs (1 minute)
```
1. Enter phone: (626) 394-7645
2. Click: "Start Call with AI Coaching"
3. Allow microphone
4. Speak: "Testing one two three"
5. Copy ALL console logs
6. Send logs to me
```

### Step 4: Check Railway Logs (1 minute)
```bash
railway logs --tail 100 > railway-logs.txt

# Send me railway-logs.txt
```

### Step 5: Test Stream Endpoint (30 seconds)
```bash
# Get your call SID from console (starts with "CA")
# Then run:
curl -s "https://avail-production.up.railway.app/api/calls/stream?callSid=CA<YOUR_SID>" | jq

# Send me the output
```

---

## COMMIT TO FIX

Once I have:
1. Browser console logs
2. Railway backend logs
3. Stream endpoint response

I will:
1. Identify the EXACT failure point
2. Implement the EXACT fix
3. Deploy and verify it works
4. Document the root cause

**This WILL be fixed.**

---

## Quick Win: Test Without Call First

Before debugging the complex call flow, let's test if basic rendering works:

```typescript
// Add to unified-call-view.tsx in useEffect after startCall():

// TEST: Add fake transcript immediately
setTimeout(() => {
  console.log('[TEST] Adding fake transcript for testing');
  setTranscript([
    {
      id: 'test-1',
      speaker: 'agent-mic',
      text: 'This is a test message from microphone',
      timestamp: Date.now(),
      isFinal: true,
    },
    {
      id: 'test-2',
      speaker: 'lead',
      text: 'This is a test message from lead',
      timestamp: Date.now() + 1000,
      isFinal: true,
    },
    {
      id: 'test-3',
      speaker: 'ai-coach',
      text: 'This is a test message from AI',
      timestamp: Date.now() + 2000,
      isFinal: true,
    },
  ]);
}, 3000);
```

If these test messages appear → transcription logic works, issue is with data capture.
If they don't appear → rendering logic is broken, need to fix UI.

---

## Final Commitment

I WILL NOT STOP until:
- ✅ You see cyan bubbles when you speak into your mic
- ✅ You see purple bubbles when lead speaks on phone
- ✅ You see amber bubbles with AI suggestions
- ✅ All three in chronological order
- ✅ Auto-scrolling to latest message

**Next action**: Wait for Railway deploy → Start call → Send me console logs → I fix it.
