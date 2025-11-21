/**
 * Intake API Endpoint - PRODUCTION READY
 *
 * Handles form submissions from website demo (contact form & booking modal)
 * Creates Business, Contact, and Deal in CRM
 * Sends confirmation SMS and email
 * Gracefully handles missing API keys with clear logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBusiness, createContact, createDeal, createMessage } from '@/lib/db-crm';
import { sendIntakeConfirmationSMS, isTwilioConfigured } from '@/lib/integrations/twilio';
import { sendIntakeConfirmationEmail, isPostmarkConfigured } from '@/lib/integrations/postmark';

export interface IntakeFormData {
  // Contact info
  name: string;
  phone: string;
  email?: string;

  // Business info (optional - for quote requests)
  service?: string;
  message?: string;

  // Booking info (optional - for appointment bookings)
  address?: string;
  date?: string;
  time?: string;
  description?: string;

  // Metadata
  formType: 'contact' | 'booking';
  teamId?: string; // Will use demo team if not provided
}

export async function POST(request: NextRequest) {
  try {
    const data: IntakeFormData = await request.json();

    console.log('📝 Intake form submission:', {
      formType: data.formType,
      name: data.name,
      phone: data.phone,
    });

    // Validate required fields
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Parse name into first/last
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Use demo team ID if not provided
    const teamId = data.teamId || 'cm3u2qe5g0000kslxvmm90uv9';

    // Extract business name from service or default to "ProPlumb Customer"
    const businessName = `${firstName} ${lastName}`;
    const industry = data.service || 'General Services';

    // Step 1: Create Business record
    const business = await createBusiness({
      team_id: teamId,
      name: businessName,
      industry,
      phone: data.phone,
      address: data.address,
      metadata: {
        source: data.formType === 'booking' ? 'website_booking' : 'website_contact',
        submittedAt: new Date().toISOString(),
      },
    });

    console.log('✅ Business created:', business.id, businessName);

    // Step 2: Create Contact record
    const contact = await createContact({
      business_id: business.id,
      first_name: firstName,
      last_name: lastName,
      email: data.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: data.phone,
      tags: [data.formType === 'booking' ? 'booking' : 'contact-form', 'website-lead'],
    });

    console.log('✅ Contact created:', contact.id, `${firstName} ${lastName}`);

    // Step 3: Create Deal record
    const dealNotes = data.formType === 'booking'
      ? `Booking request for ${data.service || 'General Service'}\n\nDate: ${data.date} at ${data.time}\nAddress: ${data.address}\n\nDetails: ${data.description}`
      : `Quote request: ${data.service}\n\nMessage: ${data.message}`;

    const deal = await createDeal({
      contact_id: contact.id,
      stage: 'new',
      value: 0,
      source: data.formType === 'booking' ? 'website_booking' : 'website_contact',
      notes: dealNotes,
    });

    console.log('✅ Deal created:', deal.id, deal.stage);

    // Step 4: Send confirmation SMS (if Twilio configured)
    let smsSent = false;
    if (isTwilioConfigured()) {
      try {
        const smsResult = await sendIntakeConfirmationSMS(
          data.phone,
          firstName,
          businessName
        );

        if (smsResult.success) {
          smsSent = true;
          console.log('✅ SMS sent:', smsResult.messageSid);

          // Log SMS message to database
          await createMessage({
            contact_id: contact.id,
            direction: 'outbound',
            channel: 'sms',
            to_number: data.phone,
            body: `Hi ${firstName}! Thanks for your interest in AVAIL. We're excited to help ${businessName} grow. We'll reach out within 24 hours to schedule your consultation call.`,
            status: 'sent',
            twilio_sid: smsResult.messageSid,
            sent_at: new Date(),
          });
        } else {
          console.warn('⚠️ SMS failed:', smsResult.error);
        }
      } catch (error: any) {
        console.error('❌ SMS error:', error.message);
      }
    } else {
      console.log('ℹ️ Twilio not configured - skipping SMS');
    }

    // Step 5: Send confirmation email (if Postmark configured)
    let emailSent = false;
    if (data.email && isPostmarkConfigured()) {
      try {
        const emailResult = await sendIntakeConfirmationEmail(
          data.email,
          firstName,
          businessName
        );

        if (emailResult.success) {
          emailSent = true;
          console.log('✅ Email sent:', emailResult.messageId);

          // Log email message to database
          await createMessage({
            contact_id: contact.id,
            direction: 'outbound',
            channel: 'email',
            to_number: data.email,
            body: `Welcome to AVAIL - Let's Get Started, ${firstName}!`,
            status: 'sent',
            postmark_message_id: emailResult.messageId,
            sent_at: new Date(),
          });
        } else {
          console.warn('⚠️ Email failed:', emailResult.error);
        }
      } catch (error: any) {
        console.error('❌ Email error:', error.message);
      }
    } else if (!data.email) {
      console.log('ℹ️ No email provided - skipping email');
    } else {
      console.log('ℹ️ Postmark not configured - skipping email');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        businessId: business.id,
        contactId: contact.id,
        dealId: deal.id,
      },
      notifications: {
        smsSent,
        emailSent,
      },
      message: 'Thank you! We will contact you within 1 hour.',
    });

  } catch (error: any) {
    console.error('❌ POST /api/intake error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process intake form',
        message: 'An error occurred. Please try again or call us directly.',
      },
      { status: 500 }
    );
  }
}
