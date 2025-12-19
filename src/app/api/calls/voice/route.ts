import { NextResponse } from "next/server";

/**
 * TwiML Voice Webhook - Handles browser-initiated calls
 *
 * This endpoint is called by Twilio when a browser makes an outgoing call.
 * It returns TwiML instructions to dial the lead's phone number.
 */
export async function POST(request: Request) {
  try {
    // Twilio sends webhooks as form-encoded data, NOT JSON
    const formData = await request.formData();
    const To = formData.get('To') as string;

    console.log("[Voice Webhook] Incoming call to:", To);

    if (!To) {
      console.error("[Voice Webhook] No 'To' number provided");
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>No destination number provided. Please try again.</Say>
</Response>`,
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Get the base URL for WebSocket streaming
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

    const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    const streamUrl = `${wsUrl}/api/calls/stream`;

    // Return TwiML to dial the lead's phone AND stream audio to WebSocket
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${streamUrl}" track="both_tracks" />
  </Start>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER || ""}" timeout="30" record="record-from-answer">
    <Number>${To}</Number>
  </Dial>
</Response>`;

    console.log("[Voice Webhook] Returning TwiML to dial:", To);

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    console.error("[Voice Webhook] Error:", error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please try again later.</Say>
</Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}
