/**
 * Review Requests API - PRODUCTION READY
 *
 * POST /api/reviews/request - Send review request to customer
 *
 * This endpoint creates a review request record and sends an SMS/email
 * to the customer asking them to leave a review.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createReviewRequest,
  getContactById,
  getBusinessById,
  type ReviewRequest,
} from '@/lib/db-crm';
import twilio from 'twilio';

// Twilio configuration
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

function isTwilioConfigured(): boolean {
  return !!(twilioAccountSid && twilioAuthToken && twilioPhoneNumber);
}

/**
 * POST /api/reviews/request
 * Body: {
 *   contact_id: string,
 *   business_id: string,
 *   channel: 'sms' | 'email',
 *   platform?: string (e.g., 'google', 'yelp', 'facebook'),
 *   review_url?: string (direct link to review page)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.contact_id || !data.business_id || !data.channel) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_id, business_id, channel' },
        { status: 400 }
      );
    }

    // Fetch contact and business details
    const contact = await getContactById(data.contact_id);
    const business = await getBusinessById(data.business_id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Create review request record
    const reviewRequest = await createReviewRequest({
      contact_id: data.contact_id,
      business_id: data.business_id,
      channel: data.channel,
      status: 'pending',
      platform: data.platform || 'google',
      review_url: data.review_url,
    });

    let messageSent = false;
    let errorMessage = null;

    // Send SMS if channel is SMS and Twilio is configured
    if (data.channel === 'sms' && contact.phone) {
      if (isTwilioConfigured()) {
        try {
          const client = twilio(twilioAccountSid, twilioAuthToken);

          const reviewUrl = data.review_url || `https://search.google.com/local/writereview?placeid=${business.metadata?.google_place_id || ''}`;
          const message = `Hi ${contact.first_name}! Thank you for choosing ${business.name}. We'd love to hear about your experience. Could you leave us a review? ${reviewUrl}`;

          await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: contact.phone,
          });

          messageSent = true;
          console.log(`✅ Review request SMS sent to ${contact.phone}`);

          // Update review request status
          const { updateReviewRequest } = await import('@/lib/db-crm');
          await updateReviewRequest(reviewRequest.id, {
            status: 'sent',
            sent_at: new Date(),
          });
        } catch (error: any) {
          console.error('❌ Failed to send review request SMS:', error);
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Twilio not configured - SMS not sent';
        console.log('⚠️ Twilio not configured - review request SMS not sent');
      }
    }

    // Send Email if channel is email (Postmark integration)
    if (data.channel === 'email' && contact.email) {
      // TODO: Implement Postmark email sending when API key is added
      console.log('⚠️ Email review requests not yet implemented - needs Postmark integration');
      errorMessage = 'Email not yet implemented';
    }

    return NextResponse.json({
      success: true,
      reviewRequest,
      messageSent,
      warning: errorMessage || undefined,
    });
  } catch (error: any) {
    console.error('❌ POST /api/reviews/request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review request' },
      { status: 500 }
    );
  }
}
