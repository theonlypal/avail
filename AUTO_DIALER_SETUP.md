# 📞 Auto Dialer Setup Guide

## Overview

The auto dialer system allows you to make outbound calls to leads directly from the dashboard using Twilio's voice API. Calls are tracked in the database with duration, status, and recordings.

## Features

✅ **One-Click Calling** - Call leads directly from dashboard  
✅ **Call Tracking** - Automatically logs all calls to database  
✅ **Call Recording** - Records all calls for quality assurance  
✅ **Demo Mode** - Works without Twilio for testing  
✅ **Call History** - View past calls per lead  
✅ **Real-time Status** - Track call status (ringing, connected, ended)

## Setup

### Step 1: Create Twilio Account (Optional)

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account (gets $15 credit)
3. Verify your phone number

### Step 2: Get Twilio Credentials

1. Go to https://console.twilio.com/
2. From the dashboard, copy:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "Show" to reveal)
3. Go to **Phone Numbers** > **Manage** > **Buy a number**
4. Purchase a phone number ($1.15/month)
5. Copy your **Phone Number** (format: +1XXXXXXXXXX)

### Step 3: Add Credentials to .env.local

Open `.env.local` and add your Twilio credentials:

```bash
# -----------------------------------------------------------------------------
# PHONE CALLING (OPTIONAL - Auto Dialer)
# -----------------------------------------------------------------------------
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+18885551234
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- `NEXT_PUBLIC_APP_URL` should be your app's URL
- For local development: `http://localhost:3000`
- For production: `https://yourapp.vercel.app`

### Step 4: Configure Twilio Webhooks (Production Only)

When deploying to production:

1. Go to https://console.twilio.com/
2. Navigate to **Phone Numbers** > **Manage** > **Active numbers**
3. Click on your phone number
4. Scroll to **Voice Configuration**
5. Set **A Call Comes In** to:
   - Webhook: `https://yourapp.vercel.app/api/calls/twiml`
   - HTTP Method: POST
6. Set **Status Callback URL** to:
   - Webhook: `https://yourapp.vercel.app/api/calls/status`
   - HTTP Method: POST
7. Click **Save**

## Demo Mode

If Twilio credentials are not configured, the system automatically runs in **demo mode**:

- ✅ Call logs are still created
- ✅ Database tracking works
- ✅ UI functions normally
- ⚠️ No actual phone calls are made

Perfect for testing without spending credits!

## Pricing

### Twilio Costs

| Service | Cost |
|---------|------|
| **Free Trial** | $15 credit |
| **Phone Number** | $1.15/month |
| **Outbound Calls** | $0.0085/minute |
| **Call Recording** | $0.0025/minute |

**Example:** 100 calls @ 5 min each = **$5.25/month** (excluding phone rental)

### Cost Comparison

- **Traditional dialer:** $50-150/month
- **Twilio auto dialer:** ~$10-30/month
- **Savings:** ~80%

## Usage

### Making a Call

1. Go to the dashboard
2. Click on a lead
3. Click the **Call** button (phone icon)
4. The dialer will appear with lead information
5. Click the green **Call** button
6. Wait for the call to connect
7. When done, click the red **End Call** button

### Call Controls

During a call:
- 🎤 **Mute/Unmute** - Toggle microphone
- 🔊 **Speaker** - Toggle speakerphone
- ⏱️ **Timer** - See call duration
- ❌ **End Call** - Hang up

### View Call History

1. Open a lead's detail page
2. Scroll to **Activity** section
3. All calls are logged with:
   - Date & time
   - Duration
   - Outcome
   - Recording (if available)

## Database Schema

The auto dialer creates a `call_logs` table:

```sql
CREATE TABLE call_logs (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  call_sid TEXT,                  -- Twilio call ID
  status TEXT NOT NULL,            -- initiated, ringing, connected, completed
  direction TEXT DEFAULT 'outbound',
  duration INTEGER DEFAULT 0,      -- seconds
  recording_url TEXT,              -- Twilio recording URL
  outcome TEXT,                    -- completed, no-answer, busy, failed
  notes TEXT,
  started_at DATETIME,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

The system includes 4 API endpoints:

### 1. POST /api/calls/initiate

Starts a new outbound call.

**Body:**
```json
{
  "lead_id": "lead-123",
  "to_number": "+18885551234"
}
```

**Response:**
```json
{
  "success": true,
  "call_id": "call-456",
  "call_sid": "CA...",
  "status": "initiated"
}
```

### 2. POST /api/calls

Saves a call log to the database.

**Body:**
```json
{
  "lead_id": "lead-123",
  "duration": 185,
  "outcome": "completed",
  "notes": "Customer interested",
  "started_at": "2025-01-15T10:00:00Z",
  "ended_at": "2025-01-15T10:03:05Z"
}
```

### 3. GET /api/calls?lead_id=xxx

Retrieves call history for a lead.

**Response:**
```json
{
  "success": true,
  "calls": [
    {
      "id": "call-456",
      "lead_id": "lead-123",
      "duration": 185,
      "status": "completed",
      "created_at": "2025-01-15T10:00:00Z",
      "member_name": "John Doe"
    }
  ]
}
```

### 4. GET/POST /api/calls/twiml

Returns TwiML instructions for Twilio.

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This is a call from Leadly AI...</Say>
</Response>
```

### 5. POST /api/calls/status

Twilio webhook for call status updates.

**Body (from Twilio):**
```
CallSid=CA...
CallStatus=completed
CallDuration=185
RecordingUrl=https://...
```

## UI Component

The auto dialer UI component is located at:

```
src/components/copilot/call-dialer.tsx
```

It includes:
- Lead information display
- Call status indicators
- Call controls (mute, speaker, end)
- Pain points reference
- Duration timer

## Troubleshooting

### "Failed to initiate call"

**Causes:**
- Invalid Twilio credentials
- Insufficient credit balance
- Invalid phone number format

**Solutions:**
1. Verify credentials in `.env.local`
2. Check credit balance at console.twilio.com
3. Ensure phone numbers use E.164 format (+1XXXXXXXXXX)

### "Call connects but no audio"

**Causes:**
- Webhooks not configured
- NEXT_PUBLIC_APP_URL incorrect
- Firewall blocking Twilio

**Solutions:**
1. Configure webhooks in Twilio console
2. Verify NEXT_PUBLIC_APP_URL matches deployed URL
3. Allow Twilio IPs in firewall

### "Demo mode even with credentials"

**Causes:**
- Environment variables not loaded
- Typo in variable names

**Solutions:**
1. Restart dev server after updating `.env.local`
2. Verify exact variable names match
3. Check for extra spaces around values

## Security Best Practices

1. **Never commit `.env.local`** - Already in .gitignore
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate Auth Token** - Change monthly from Twilio console
4. **Monitor usage** - Set up spending alerts in Twilio
5. **Verify webhooks** - Use Twilio signature validation

## Next Steps

After setup:

1. Test in demo mode first (no credentials)
2. Add Twilio credentials
3. Make a test call to your own phone
4. Review call logs in database
5. Configure webhooks for production
6. Deploy to Vercel/production

## Support

- **Twilio Docs:** https://www.twilio.com/docs/voice
- **Twilio Support:** https://support.twilio.com/
- **Leadly Issues:** File issue in project repo

## Pricing Calculator

Estimate your monthly costs:

```
Calls per month: 100
Avg call duration: 5 minutes
Phone number rental: $1.15
Call cost: 100 × 5 × $0.0085 = $4.25
Recording cost: 100 × 5 × $0.0025 = $1.25
─────────────────────────────────────────
Total: ~$6.65/month
```

Compare to traditional dialers at $50-150/month!
