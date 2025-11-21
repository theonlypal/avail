/**
 * Postmark Integration - PRODUCTION READY
 *
 * Real email integration using Postmark SDK
 * Just plug in POSTMARK_API_KEY
 */

import * as postmark from 'postmark';

// Initialize Postmark client (only if API key is present)
let postmarkClient: postmark.ServerClient | null = null;

function getPostmarkClient() {
  if (postmarkClient) return postmarkClient;

  const apiKey = process.env.POSTMARK_API_KEY;

  if (!apiKey) {
    console.warn('Postmark API key not configured. Email features will be disabled.');
    return null;
  }

  postmarkClient = new postmark.ServerClient(apiKey);
  return postmarkClient;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  from?: string;
  replyTo?: string;
  tag?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Postmark
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResponse> {
  const client = getPostmarkClient();

  if (!client) {
    return {
      success: false,
      error: 'Postmark not configured',
    };
  }

  const from = options.from || 'hello@avail.ai';

  try {
    const result = await client.sendEmail({
      From: from,
      To: options.to,
      Subject: options.subject,
      HtmlBody: options.htmlBody,
      TextBody: options.textBody,
      ReplyTo: options.replyTo,
      Tag: options.tag,
      MessageStream: 'outbound',
    });

    return {
      success: true,
      messageId: result.MessageID,
    };
  } catch (error: any) {
    console.error('Postmark email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send intake confirmation email
 */
export async function sendIntakeConfirmationEmail(
  email: string,
  firstName: string,
  company: string
): Promise<SendEmailResponse> {
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Welcome to AVAIL!</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>

      <p>Thank you for your interest in AVAIL! We're excited to help <strong>${company}</strong> grow with our AI-powered automation platform.</p>

      <p>We've received your information and our team will reach out within 24 hours to schedule your personalized consultation call.</p>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your business needs</li>
        <li>We'll prepare a custom demo tailored to ${company}</li>
        <li>You'll receive a calendar invite for your consultation</li>
        <li>We'll discuss how AVAIL can drive growth for your business</li>
      </ul>

      <p>In the meantime, feel free to reply to this email with any questions. We're here to help!</p>

      <p>Best regards,<br>
      <strong>The AVAIL Team</strong></p>

      <div class="footer">
        <p>AVAIL - AI-Powered Business Automation</p>
        <p>Questions? Reply to this email or call us at +1 (213) 555-0120</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `Hi ${firstName},

Thank you for your interest in AVAIL! We're excited to help ${company} grow with our AI-powered automation platform.

We've received your information and our team will reach out within 24 hours to schedule your personalized consultation call.

What happens next?
- Our team will review your business needs
- We'll prepare a custom demo tailored to ${company}
- You'll receive a calendar invite for your consultation
- We'll discuss how AVAIL can drive growth for your business

In the meantime, feel free to reply to this email with any questions. We're here to help!

Best regards,
The AVAIL Team

---
AVAIL - AI-Powered Business Automation
Questions? Reply to this email or call us at +1 (213) 555-0120`;

  return sendEmail({
    to: email,
    subject: `Welcome to AVAIL - Let's Get Started, ${firstName}!`,
    htmlBody,
    textBody,
    tag: 'intake-confirmation',
  });
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(
  email: string,
  firstName: string,
  appointmentTime: string,
  appointmentDetails: string
): Promise<SendEmailResponse> {
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .appointment-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Appointment Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>

      <p>This is a friendly reminder about your upcoming AVAIL consultation:</p>

      <div class="appointment-box">
        <h3 style="margin-top: 0;">📅 ${appointmentTime}</h3>
        <p style="margin-bottom: 0;">${appointmentDetails}</p>
      </div>

      <p>We're looking forward to speaking with you and showing you how AVAIL can transform your business operations!</p>

      <p>If you need to reschedule, please reply to this email or give us a call.</p>

      <p>See you soon!<br>
      <strong>The AVAIL Team</strong></p>

      <div class="footer">
        <p>AVAIL - AI-Powered Business Automation</p>
        <p>Questions? Reply to this email or call us at +1 (213) 555-0120</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `Hi ${firstName},

This is a friendly reminder about your upcoming AVAIL consultation:

${appointmentTime}
${appointmentDetails}

We're looking forward to speaking with you and showing you how AVAIL can transform your business operations!

If you need to reschedule, please reply to this email or give us a call.

See you soon!
The AVAIL Team

---
AVAIL - AI-Powered Business Automation
Questions? Reply to this email or call us at +1 (213) 555-0120`;

  return sendEmail({
    to: email,
    subject: `Reminder: Your AVAIL Consultation is Coming Up`,
    htmlBody,
    textBody,
    tag: 'appointment-reminder',
  });
}

/**
 * Check if Postmark is configured
 */
export function isPostmarkConfigured(): boolean {
  return !!process.env.POSTMARK_API_KEY;
}
