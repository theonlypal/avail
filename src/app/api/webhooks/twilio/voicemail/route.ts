/**
 * Twilio Voicemail Transcription Webhook - PRODUCTION READY
 *
 * Handles voicemail recording transcriptions from Twilio
 * - Receives recording URL and transcription text
 * - Saves to CRM database as a message
 * - Can trigger notifications to team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/lib/db-crm';
import twilio from 'twilio';

const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';

/**
 * POST /api/webhooks/twilio/voicemail
 *
 * Twilio sends:
 * - RecordingUrl: URL to the audio recording
 * - RecordingSid: Unique recording ID
 * - RecordingDuration: Duration in seconds
 * - TranscriptionText: Transcribed text (if available)
 * - TranscriptionStatus: completed, failed, in-progress
 * - From: Caller's phone number
 * - To: Your Twilio number
 * - CallSid: Associated call ID
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;
    const transcriptionText = formData.get('TranscriptionText') as string;
    const transcriptionStatus = formData.get('TranscriptionStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;

    console.log('🎤 Voicemail transcription webhook:', {
      from,
      recordingSid,
      duration: recordingDuration,
      transcriptionStatus,
      hasTranscription: !!transcriptionText,
    });

    // Validate Twilio signature
    const twilioSignature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;

    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    if (twilioAuthToken) {
      const isValid = twilio.validateRequest(
        twilioAuthToken,
        twilioSignature,
        url,
        params
      );

      if (!isValid) {
        console.error('❌ Invalid Twilio signature on voicemail webhook');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Save voicemail to database
    try {
      const messageBody = transcriptionText
        ? `Voicemail (${recordingDuration}s): ${transcriptionText}`
        : `Voicemail recording (${recordingDuration}s) - No transcription available`;

      await createMessage({
        contact_id: null, // Will be linked when contact lookup is implemented
        direction: 'inbound',
        channel: 'sms', // Using sms channel for all communications
        from_number: from,
        to_number: to,
        body: messageBody,
        status: transcriptionStatus === 'completed' ? 'received' : 'pending',
        twilio_sid: callSid,
        metadata: {
          type: 'voicemail',
          recordingSid,
          recordingUrl,
          recordingDuration: parseInt(recordingDuration || '0'),
          transcriptionText: transcriptionText || null,
          transcriptionStatus,
          rawWebhook: params,
        },
        sent_at: new Date(),
      });

      console.log('✅ Voicemail saved to database:', recordingSid);

      // TODO: Send notification to team members
      // - Email with transcription
      // - SMS alert to on-call staff
      // - Slack/Discord notification

    } catch (dbError: any) {
      console.error('❌ Failed to save voicemail to database:', dbError.message);
    }

    // Always return 200 to Twilio
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('❌ POST /api/webhooks/twilio/voicemail error:', error);
    return new NextResponse('OK', { status: 200 }); // Don't let Twilio retry
  }
}
