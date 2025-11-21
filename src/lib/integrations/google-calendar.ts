/**
 * Google Calendar Integration - PRODUCTION READY
 *
 * Manages calendar events for appointments
 * - Create calendar events
 * - Update event times
 * - Delete events
 * - Fetch availability
 *
 * Setup:
 * 1. Enable Google Calendar API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials
 * 3. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
 * 4. Implement OAuth flow for users to authorize access
 */

import { google } from 'googleapis';

// Initialize Google Calendar API client
function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL || 'http://localhost:3000'
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface CalendarEvent {
  summary: string; // Event title
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[]; // Email addresses
  timezone?: string;
}

export interface CreateEventResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent,
  calendarId: string = 'primary'
): Promise<CreateEventResult> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        success: false,
        error: 'Google Calendar not configured - missing credentials',
      };
    }

    const calendar = getCalendarClient(accessToken);

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone || 'America/Los_Angeles',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone || 'America/Los_Angeles',
        },
        attendees: event.attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (error: any) {
    console.error('Google Calendar create event error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create calendar event',
    };
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<CalendarEvent>,
  calendarId: string = 'primary'
): Promise<CreateEventResult> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        success: false,
        error: 'Google Calendar not configured',
      };
    }

    const calendar = getCalendarClient(accessToken);

    const updateData: any = {};

    if (updates.summary) updateData.summary = updates.summary;
    if (updates.description) updateData.description = updates.description;
    if (updates.location) updateData.location = updates.location;

    if (updates.startTime && updates.endTime) {
      updateData.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: updates.timezone || 'America/Los_Angeles',
      };
      updateData.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: updates.timezone || 'America/Los_Angeles',
      };
    }

    if (updates.attendees) {
      updateData.attendees = updates.attendees.map((email) => ({ email }));
    }

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updateData,
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (error: any) {
    console.error('Google Calendar update event error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update calendar event',
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        success: false,
        error: 'Google Calendar not configured',
      };
    }

    const calendar = getCalendarClient(accessToken);

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Google Calendar delete event error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete calendar event',
    };
  }
}

/**
 * Get free/busy information for availability checking
 */
export async function getFreeBusy(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  calendarIds: string[] = ['primary']
): Promise<{
  success: boolean;
  busySlots?: Array<{ start: Date; end: Date }>;
  error?: string;
}> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        success: false,
        error: 'Google Calendar not configured',
      };
    }

    const calendar = getCalendarClient(accessToken);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: calendarIds.map((id) => ({ id })),
      },
    });

    const busySlots: Array<{ start: Date; end: Date }> = [];

    for (const calendarId of calendarIds) {
      const calendarBusy = response.data.calendars?.[calendarId]?.busy || [];
      for (const slot of calendarBusy) {
        if (slot.start && slot.end) {
          busySlots.push({
            start: new Date(slot.start),
            end: new Date(slot.end),
          });
        }
      }
    }

    return {
      success: true,
      busySlots,
    };
  } catch (error: any) {
    console.error('Google Calendar free/busy error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch availability',
    };
  }
}

/**
 * Check if Google Calendar is configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Placeholder: Get OAuth authorization URL
 * In production, implement full OAuth flow with NextAuth or custom solution
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}
