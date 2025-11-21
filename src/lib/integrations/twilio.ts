/**
 * Twilio Integration - PRODUCTION READY
 *
 * Real SMS/Voice integration using Twilio SDK
 * Just plug in TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import twilio from 'twilio';

// Initialize Twilio client (only if credentials are present)
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. SMS/Voice features will be disabled.');
    return null;
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export interface SendSMSOptions {
  to: string;
  body: string;
  from?: string;
}

export interface SendSMSResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
  status?: string;
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResponse> {
  const client = getTwilioClient();

  if (!client) {
    return {
      success: false,
      error: 'Twilio not configured',
    };
  }

  const from = options.from || process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    return {
      success: false,
      error: 'TWILIO_PHONE_NUMBER not configured',
    };
  }

  try {
    const message = await client.messages.create({
      body: options.body,
      from,
      to: options.to,
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
    };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export interface SendVoiceOptions {
  to: string;
  twiml: string;
  from?: string;
}

export interface SendVoiceResponse {
  success: boolean;
  callSid?: string;
  error?: string;
  status?: string;
}

/**
 * Make voice call via Twilio
 */
export async function sendVoiceCall(options: SendVoiceOptions): Promise<SendVoiceResponse> {
  const client = getTwilioClient();

  if (!client) {
    return {
      success: false,
      error: 'Twilio not configured',
    };
  }

  const from = options.from || process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    return {
      success: false,
      error: 'TWILIO_PHONE_NUMBER not configured',
    };
  }

  try {
    const call = await client.calls.create({
      twiml: options.twiml,
      from,
      to: options.to,
    });

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
    };
  } catch (error: any) {
    console.error('Twilio Voice error:', error);
    return {
      success: false,
      error: error.message || 'Failed to make call',
    };
  }
}

/**
 * Get message history for a contact
 */
export async function getMessages(phoneNumber: string, limit = 50) {
  const client = getTwilioClient();

  if (!client) {
    return [];
  }

  try {
    const messages = await client.messages.list({
      to: phoneNumber,
      limit,
    });

    return messages.map(msg => ({
      sid: msg.sid,
      from: msg.from,
      to: msg.to,
      body: msg.body,
      status: msg.status,
      direction: msg.direction,
      dateCreated: msg.dateCreated,
      dateSent: msg.dateSent,
    }));
  } catch (error: any) {
    console.error('Twilio get messages error:', error);
    return [];
  }
}

/**
 * Get call logs for a contact
 */
export async function getCallLogs(phoneNumber: string, limit = 50) {
  const client = getTwilioClient();

  if (!client) {
    return [];
  }

  try {
    const calls = await client.calls.list({
      to: phoneNumber,
      limit,
    });

    return calls.map(call => ({
      sid: call.sid,
      from: call.from,
      to: call.to,
      status: call.status,
      duration: call.duration,
      direction: call.direction,
      dateCreated: call.dateCreated,
      startTime: call.startTime,
      endTime: call.endTime,
    }));
  } catch (error: any) {
    console.error('Twilio get call logs error:', error);
    return [];
  }
}

/**
 * Send intake confirmation SMS
 */
export async function sendIntakeConfirmationSMS(
  phoneNumber: string,
  firstName: string,
  company: string
): Promise<SendSMSResponse> {
  const body = `Hi ${firstName}! Thanks for your interest in AVAIL. We're excited to help ${company} grow. We'll reach out within 24 hours to schedule your consultation call. Reply STOP to opt out.`;

  return sendSMS({
    to: phoneNumber,
    body,
  });
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSMS(
  phoneNumber: string,
  appointmentTime: string,
  firstName: string
): Promise<SendSMSResponse> {
  const body = `Hi ${firstName}! This is a reminder about your AVAIL consultation scheduled for ${appointmentTime}. We're looking forward to speaking with you! Reply STOP to opt out.`;

  return sendSMS({
    to: phoneNumber,
    body,
  });
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}
