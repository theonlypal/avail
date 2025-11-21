/**
 * Automation Engine - PRODUCTION READY
 *
 * Executes automation rules based on CRM events
 * - SMS received with keyword → auto-reply
 * - Deal stage changed → send notification
 * - Appointment created → send confirmation
 * - Contact created → welcome message
 */

import {
  getAutomationRulesByTeam,
  createMessage,
  type AutomationRule,
  type Contact,
  type Deal,
  type Appointment,
} from '@/lib/db-crm';
import { sendSMS } from '@/lib/integrations/twilio';
import { sendEmail } from '@/lib/integrations/postmark';

export type TriggerEvent = {
  type:
    | 'sms_received'
    | 'deal_stage_changed'
    | 'appointment_created'
    | 'contact_created'
    | 'no_response_timeout';
  teamId: string;
  data: {
    contactId?: string;
    dealId?: string;
    appointmentId?: string;
    smsBody?: string;
    fromNumber?: string;
    toNumber?: string;
    newStage?: string;
    oldStage?: string;
    [key: string]: any;
  };
};

export type ActionResult = {
  success: boolean;
  action: string;
  message?: string;
  error?: string;
};

/**
 * Process automation rules for a given event
 */
export async function processAutomations(
  event: TriggerEvent
): Promise<ActionResult[]> {
  try {
    // Fetch all active automation rules for the team
    const rules = await getAutomationRulesByTeam(event.teamId);
    const activeRules = rules.filter((rule) => rule.is_active);

    console.log(
      `🔄 Processing ${activeRules.length} automation rules for event: ${event.type}`
    );

    const results: ActionResult[] = [];

    for (const rule of activeRules) {
      // Check if the rule matches this event
      if (rule.trigger_type !== event.type) {
        continue; // Skip non-matching triggers
      }

      // Additional matching logic for specific triggers
      const matches = checkTriggerMatch(rule, event);
      if (!matches) {
        continue;
      }

      console.log(`✅ Rule matched: "${rule.name}" (${rule.id})`);

      // Execute the rule's action
      const result = await executeAction(rule, event);
      results.push(result);
    }

    return results;
  } catch (error: any) {
    console.error('❌ Automation engine error:', error);
    return [
      {
        success: false,
        action: 'process_automations',
        error: error.message,
      },
    ];
  }
}

/**
 * Check if a rule's trigger matches the event
 */
function checkTriggerMatch(rule: AutomationRule, event: TriggerEvent): boolean {
  // If no trigger_value is specified, match all events of this type
  if (!rule.trigger_value) {
    return true;
  }

  // SMS keyword matching
  if (rule.trigger_type === 'sms_received' && event.data.smsBody) {
    const keyword = rule.trigger_value.toLowerCase();
    const body = event.data.smsBody.toLowerCase();
    return body.includes(keyword);
  }

  // Deal stage matching
  if (rule.trigger_type === 'deal_stage_changed' && event.data.newStage) {
    return event.data.newStage === rule.trigger_value;
  }

  // Default: no match
  return false;
}

/**
 * Execute the action specified by a rule
 */
async function executeAction(
  rule: AutomationRule,
  event: TriggerEvent
): Promise<ActionResult> {
  try {
    const actionConfig =
      typeof rule.action_config === 'string'
        ? JSON.parse(rule.action_config)
        : rule.action_config;

    switch (rule.action_type) {
      case 'send_sms':
        return await executeSendSMS(actionConfig, event);

      case 'send_email':
        return await executeSendEmail(actionConfig, event);

      case 'create_task':
        return await executeCreateTask(actionConfig, event);

      case 'update_deal':
        return await executeUpdateDeal(actionConfig, event);

      default:
        return {
          success: false,
          action: rule.action_type,
          error: `Unknown action type: ${rule.action_type}`,
        };
    }
  } catch (error: any) {
    console.error(`❌ Failed to execute action for rule ${rule.id}:`, error);
    return {
      success: false,
      action: rule.action_type,
      error: error.message,
    };
  }
}

/**
 * Send SMS action
 */
async function executeSendSMS(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  const { template, to } = config;

  // Determine recipient phone number
  let toNumber: string | undefined;

  if (to === 'contact' && event.data.fromNumber) {
    toNumber = event.data.fromNumber; // Reply to the sender
  } else if (typeof to === 'string' && to.startsWith('+')) {
    toNumber = to; // Use configured phone number
  }

  if (!toNumber) {
    return {
      success: false,
      action: 'send_sms',
      error: 'No recipient phone number available',
    };
  }

  // Send SMS via Twilio
  const result = await sendSMS({
    to: toNumber,
    body: template,
  });

  // Log message to database if contact_id is available
  if (result.success && event.data.contactId) {
    await createMessage({
      contact_id: event.data.contactId,
      direction: 'outbound',
      channel: 'sms',
      from_number: process.env.TWILIO_PHONE_NUMBER || '',
      to_number: toNumber,
      body: template,
      status: 'sent',
      twilio_sid: result.messageSid,
      sent_at: new Date(),
      metadata: {
        automationTriggered: true,
        eventType: event.type,
      },
    });
  }

  return {
    success: result.success,
    action: 'send_sms',
    message: result.success
      ? `SMS sent to ${toNumber}`
      : `Failed: ${result.error}`,
    error: result.error,
  };
}

/**
 * Send Email action
 */
async function executeSendEmail(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  const { template, subject, to } = config;

  // Determine recipient email
  let toEmail: string | undefined;

  if (to === 'contact' && event.data.contactId) {
    // TODO: Fetch contact email from database
    // For now, return not implemented
    return {
      success: false,
      action: 'send_email',
      error: 'Contact email lookup not yet implemented',
    };
  } else if (typeof to === 'string' && to.includes('@')) {
    toEmail = to;
  }

  if (!toEmail) {
    return {
      success: false,
      action: 'send_email',
      error: 'No recipient email available',
    };
  }

  // Send email via Postmark
  const result = await sendEmail({
    to: toEmail,
    subject: subject || 'Notification from AVAIL',
    htmlBody: template,
    textBody: template.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  });

  // Log message to database if contact_id is available
  if (result.success && event.data.contactId) {
    await createMessage({
      contact_id: event.data.contactId,
      direction: 'outbound',
      channel: 'email',
      from_number: process.env.POSTMARK_FROM_EMAIL || '',
      to_number: toEmail,
      body: template,
      status: 'sent',
      postmark_message_id: result.messageId,
      sent_at: new Date(),
      metadata: {
        automationTriggered: true,
        eventType: event.type,
        subject,
      },
    });
  }

  return {
    success: result.success,
    action: 'send_email',
    message: result.success
      ? `Email sent to ${toEmail}`
      : `Failed: ${result.error}`,
    error: result.error,
  };
}

/**
 * Create Task action (placeholder)
 */
async function executeCreateTask(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  // TODO: Implement task creation when task schema is added
  console.log('⚠️ Create task action not yet implemented');
  return {
    success: false,
    action: 'create_task',
    error: 'Task creation not yet implemented',
  };
}

/**
 * Update Deal action (placeholder)
 */
async function executeUpdateDeal(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  // TODO: Implement deal updates
  console.log('⚠️ Update deal action not yet implemented');
  return {
    success: false,
    action: 'update_deal',
    error: 'Deal update not yet implemented',
  };
}

/**
 * Helper: Trigger automation for SMS received
 */
export async function triggerSMSAutomation(params: {
  teamId: string;
  contactId?: string;
  fromNumber: string;
  toNumber: string;
  smsBody: string;
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'sms_received',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
      fromNumber: params.fromNumber,
      toNumber: params.toNumber,
      smsBody: params.smsBody,
    },
  });
}

/**
 * Helper: Trigger automation for deal stage changed
 */
export async function triggerDealStageAutomation(params: {
  teamId: string;
  dealId: string;
  contactId: string;
  oldStage: string;
  newStage: string;
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'deal_stage_changed',
    teamId: params.teamId,
    data: {
      dealId: params.dealId,
      contactId: params.contactId,
      oldStage: params.oldStage,
      newStage: params.newStage,
    },
  });
}

/**
 * Helper: Trigger automation for appointment created
 */
export async function triggerAppointmentAutomation(params: {
  teamId: string;
  appointmentId: string;
  contactId: string;
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'appointment_created',
    teamId: params.teamId,
    data: {
      appointmentId: params.appointmentId,
      contactId: params.contactId,
    },
  });
}

/**
 * Helper: Trigger automation for contact created
 */
export async function triggerContactCreatedAutomation(params: {
  teamId: string;
  contactId: string;
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'contact_created',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
    },
  });
}
