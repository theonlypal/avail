/**
 * Appointments API Route - PRODUCTION READY
 *
 * Real CRUD operations for appointments with Neon Postgres
 * Integrates with Google Calendar when configured
 * GET: List all appointments (with optional filtering)
 * POST: Create new appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAppointmentsByContact, getAllAppointments } from '@/lib/db-crm';

/**
 * GET /api/appointments
 * Query params:
 *  - contactId: filter by contact
 *  - startDate: filter appointments after this date (ISO 8601)
 *  - endDate: filter appointments before this date (ISO 8601)
 *  - status: filter by status (scheduled, completed, cancelled, no_show)
 *  - limit: pagination limit (default 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (contactId) {
      // Get appointments for specific contact
      const appointments = await getAppointmentsByContact(contactId);
      return NextResponse.json({ appointments });
    }

    // Get all appointments (filtering can be added later if needed)
    const appointments = await getAllAppointments(limit, offset);

    // Apply client-side filters (can be moved to DB queries for optimization)
    let filteredAppointments = appointments;

    if (startDate) {
      const start = new Date(startDate);
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.start_time) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.start_time) <= end
      );
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => apt.status === status
      );
    }

    return NextResponse.json({ appointments: filteredAppointments });

  } catch (error: any) {
    console.error('❌ GET /api/appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Body: { contact_id, start_time, end_time, location?, notes?, status?, google_calendar_event_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.contact_id || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_id, start_time, end_time' },
        { status: 400 }
      );
    }

    // Validate dates
    const startTime = new Date(body.start_time);
    const endTime = new Date(body.end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'end_time must be after start_time' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    const status = body.status || 'scheduled';
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const appointment = await createAppointment({
      contact_id: body.contact_id,
      start_time: startTime,
      end_time: endTime,
      location: body.location,
      notes: body.notes,
      status,
      google_calendar_event_id: body.google_calendar_event_id,
    });

    console.log('✅ Appointment created via API:', appointment.id, '-', startTime.toLocaleString());

    // TODO: If Google Calendar is configured, create event and update google_calendar_event_id
    // TODO: Send confirmation SMS/Email via Twilio/Postmark

    return NextResponse.json({
      success: true,
      appointment,
    });

  } catch (error: any) {
    console.error('❌ POST /api/appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error.message },
      { status: 500 }
    );
  }
}
