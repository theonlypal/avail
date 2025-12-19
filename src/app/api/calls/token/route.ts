import { NextResponse } from "next/server";
import twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

/**
 * Generate a Twilio Access Token for browser-to-phone calling
 * This token allows the browser to establish a WebRTC connection to Twilio
 */
export async function POST(request: Request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      console.error("[Token API] Missing Twilio credentials:", {
        accountSid: !!accountSid,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
        twimlAppSid: !!twimlAppSid,
      });
      return NextResponse.json(
        { error: "Missing Twilio credentials" },
        { status: 500 }
      );
    }

    // Generate a random identity for this call session
    const identity = `user_${Date.now()}`;

    // Create an access token
    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600, // 1 hour
    });

    // Create a Voice grant for the token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false, // We only need outgoing calls
    });

    token.addGrant(voiceGrant);

    console.log("[Token API] Generated access token for identity:", identity);

    return NextResponse.json({
      token: token.toJwt(),
      identity,
    });
  } catch (error: any) {
    console.error("[Token API] Error generating token:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate access token" },
      { status: 500 }
    );
  }
}
