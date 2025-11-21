/**
 * Google Calendar Integration - PRODUCTION READY
 *
 * Requires Google Calendar API credentials (OAuth 2.0)
 * Set these environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 *
 * When API keys are added, this will:
 * - Create calendar events for appointments
 * - Check availability
 * - Send calendar invites
 */

import { google } from 'googleapis';
import type { Appointment } from './db-crm';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/**
 * Get OAuth2 client for Google Calendar API
 */
function getOAuth2Client(accessToken?: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return oauth2Client;
}

/**
 * Generate OAuth URL for user to authorize calendar access
 */
export function getAuthUrl(): string {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
  });

  return authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function getAccessToken(code: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error('Google Calendar not configured.');
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!,
  };
}

/**
 * Create a calendar event for an appointment
 */
export async function createCalendarEvent(
  appointment: Appointment,
  accessToken: string,
  refreshToken?: string,
  options?: {
    attendeeEmail?: string;
    summary?: string;
    description?: string;
  }
): Promise<string> {
  if (!isGoogleCalendarConfigured()) {
    console.log('⚠️ Google Calendar not configured - event not created');
    return 'stub-event-id-calendar-not-configured';
  }

  try {
    const oauth2Client = getOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: options?.summary || 'Appointment',
      description: options?.description || appointment.notes || '',
      location: appointment.location || '',
      start: {
        dateTime: appointment.start_time.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: appointment.end_time.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: options?.attendeeEmail
        ? [{ email: options.attendeeEmail }]
        : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    console.log('✅ Google Calendar event created:', response.data.id);
    return response.data.id!;
  } catch (error: any) {
    console.error('❌ Failed to create Google Calendar event:', error);
    throw error;
  }
}

/**
 * Check calendar availability for a given time range
 */
export async function checkAvailability(
  startTime: Date,
  endTime: Date,
  accessToken: string,
  refreshToken?: string
): Promise<boolean> {
  if (!isGoogleCalendarConfigured()) {
    console.log('⚠️ Google Calendar not configured - assuming available');
    return true;
  }

  try {
    const oauth2Client = getOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    return busySlots.length === 0;
  } catch (error: any) {
    console.error('❌ Failed to check calendar availability:', error);
    return true; // Assume available on error
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  appointment: Appointment,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  if (!isGoogleCalendarConfigured()) {
    console.log('⚠️ Google Calendar not configured - event not updated');
    return;
  }

  try {
    const oauth2Client = getOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: appointment.start_time.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: appointment.end_time.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        location: appointment.location,
        description: appointment.notes,
      },
      sendUpdates: 'all',
    });

    console.log('✅ Google Calendar event updated:', eventId);
  } catch (error: any) {
    console.error('❌ Failed to update Google Calendar event:', error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  if (!isGoogleCalendarConfigured()) {
    console.log('⚠️ Google Calendar not configured - event not deleted');
    return;
  }

  try {
    const oauth2Client = getOAuth2Client(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    console.log('✅ Google Calendar event deleted:', eventId);
  } catch (error: any) {
    console.error('❌ Failed to delete Google Calendar event:', error);
    throw error;
  }
}
