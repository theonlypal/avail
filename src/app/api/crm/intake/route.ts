/**
 * CRM Intake API Route - PRODUCTION READY
 *
 * Real implementation with:
 * 1. Create Business record in Neon Postgres
 * 2. Create Contact record linked to Business
 * 3. Create Deal record in "New" stage
 * 4. Send confirmation SMS via Twilio
 * 5. Send confirmation email via Postmark
 * 6. Log message records to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBusiness, createContact, createDeal, createMessage } from '@/lib/db-crm';
import { sendIntakeConfirmationSMS, isTwilioConfigured } from '@/lib/integrations/twilio';
import { sendIntakeConfirmationEmail, isPostmarkConfigured } from '@/lib/integrations/postmark';

interface IntakeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  city: string;
  state: string;
  industry: string;
  jobsPerMonth: number;
  avgTicket: number;
  painPoints: string[];
  preferredTime: string;
  calculatorData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const formData: IntakeFormData = await request.json();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get default team (for MVP, we'll use first team or create one)
    // In production, this would come from authentication
    const DEFAULT_TEAM_ID = 'default-team-avail';

    // 1. Create Business record
    const business = await createBusiness({
      team_id: DEFAULT_TEAM_ID,
      name: formData.company,
      industry: formData.industry,
      website: formData.website,
      address: `${formData.city}, ${formData.state}`,
      city: formData.city,
      state: formData.state,
      metadata: {
        jobsPerMonth: formData.jobsPerMonth,
        avgTicket: formData.avgTicket,
        painPoints: formData.painPoints,
        preferredTime: formData.preferredTime,
        calculatorData: formData.calculatorData,
      },
    });

    console.log('✅ Business created:', business.id);

    // 2. Create Contact record
    const contact = await createContact({
      business_id: business.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      tags: ['intake-form', 'new-lead'],
    });

    console.log('✅ Contact created:', contact.id);

    // 3. Create Deal in "New" stage
    const estimatedValue = (formData.avgTicket || 0) * (formData.jobsPerMonth || 0) * 3; // 3-month estimate
    const deal = await createDeal({
      contact_id: contact.id,
      stage: 'new',
      value: estimatedValue,
      source: 'intake-form',
      notes: JSON.stringify({
        painPoints: formData.painPoints,
        preferredTime: formData.preferredTime,
        calculatorData: formData.calculatorData,
      }),
    });

    console.log('✅ Deal created:', deal.id, '- Value:', estimatedValue);

    // 4. Send confirmation SMS via Twilio (if configured)
    let smsResult = null;
    if (isTwilioConfigured()) {
      smsResult = await sendIntakeConfirmationSMS(
        formData.phone,
        formData.firstName,
        formData.company
      );

      if (smsResult.success) {
        console.log('✅ SMS sent:', smsResult.messageSid);

        // Log SMS in database
        await createMessage({
          contact_id: contact.id,
          direction: 'outbound',
          channel: 'sms',
          body: `Hi ${formData.firstName}! Thanks for your interest in AVAIL. We'll be in touch within 24 hours to schedule your call.`,
          status: smsResult.status || 'sent',
          twilio_sid: smsResult.messageSid,
          sent_at: new Date(),
        });
      } else {
        console.warn('⚠️  SMS failed:', smsResult.error);
      }
    } else {
      console.log('ℹ️  Twilio not configured - SMS skipped');
    }

    // 5. Send confirmation email via Postmark (if configured)
    let emailResult = null;
    if (isPostmarkConfigured()) {
      emailResult = await sendIntakeConfirmationEmail(
        formData.email,
        formData.firstName,
        formData.company
      );

      if (emailResult.success) {
        console.log('✅ Email sent:', emailResult.messageId);

        // Log email in database
        await createMessage({
          contact_id: contact.id,
          direction: 'outbound',
          channel: 'email',
          body: `Welcome to AVAIL - Let's Get Started, ${formData.firstName}!`,
          status: 'sent',
          postmark_message_id: emailResult.messageId,
          sent_at: new Date(),
        });
      } else {
        console.warn('⚠️  Email failed:', emailResult.error);
      }
    } else {
      console.log('ℹ️  Postmark not configured - Email skipped');
    }

    return NextResponse.json({
      success: true,
      message: 'Intake form submitted successfully',
      businessId: business.id,
      contactId: contact.id,
      dealId: deal.id,
      notifications: {
        sms: smsResult?.success || false,
        email: emailResult?.success || false,
      },
    });

  } catch (error: any) {
    console.error('❌ Intake API error:', error);
    return NextResponse.json(
      { error: 'Failed to process intake form', details: error.message },
      { status: 500 }
    );
  }
}
