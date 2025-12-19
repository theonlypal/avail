/**
 * Automation Engine - PRODUCTION READY
 *
 * Executes automation rules based on CRM events
 * - Lead/Contact created → welcome message
 * - Deal stage changed → send notification
 * - Booking scheduled → send confirmation
 * - Score threshold reached → notify team
 * - No response timeout → follow-up sequence
 * - Tag added → trigger workflow
 *
 * Features:
 * - Immediate and delayed actions
 * - Template interpolation
 * - Action scheduling and queue processing
 * - Communication logging
 */

import {
  getAutomationDb,
  type TriggerType,
  type ActionType,
  type AutomationRule,
  type AutomationAction,
  type AutomationLog,
} from './db-automation';
import { sendSMS } from '@/lib/integrations/twilio';
import { sendEmail } from '@/lib/integrations/postmark';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const IS_PRODUCTION = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

// PostgreSQL Pool for production (Railway)
const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pgPool: Pool | null = null;
if (IS_PRODUCTION && postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

// ============================================
// TYPES
// ============================================

export type TriggerEvent = {
  type: TriggerType;
  teamId: string;
  data: {
    // Entity IDs
    leadId?: string;
    contactId?: string;
    dealId?: string;
    bookingId?: string;
    // Entity data for template interpolation
    lead?: {
      id: string;
      business_name?: string;
      contact_name?: string;
      email?: string;
      phone?: string;
      score?: number;
      [key: string]: any;
    };
    contact?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      company?: string;
      [key: string]: any;
    };
    deal?: {
      id: string;
      name?: string;
      value?: number;
      stage?: string;
      [key: string]: any;
    };
    // Event-specific data
    previousStage?: string;
    newStage?: string;
    previousScore?: number;
    newScore?: number;
    tagId?: string;
    tagName?: string;
    formData?: Record<string, any>;
    bookingData?: {
      title?: string;
      start_time?: string;
      end_time?: string;
    };
    // Legacy fields for SMS
    smsBody?: string;
    fromNumber?: string;
    toNumber?: string;
    [key: string]: any;
  };
};

export type ActionResult = {
  success: boolean;
  action: string;
  message?: string;
  error?: string;
  externalId?: string;
};

export interface TemplateVariables {
  business_name?: string;
  contact_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  score?: number;
  deal_name?: string;
  deal_value?: number;
  stage?: string;
  booking_link?: string;
  booking_time?: string;
  team_name?: string;
  [key: string]: any;
}

// ============================================
// MAIN PROCESSOR
// ============================================

/**
 * Process automation rules for a given event
 */
export async function processAutomations(
  event: TriggerEvent
): Promise<ActionResult[]> {
  try {
    // Fetch all active automation rules for the team that match this trigger
    const rules = await getActiveRulesForTrigger(event.type, event.teamId);

    console.log(
      `🔄 Processing ${rules.length} automation rules for event: ${event.type}`
    );

    const results: ActionResult[] = [];

    for (const rule of rules) {
      // Additional matching logic for specific triggers
      const matches = checkTriggerMatch(rule, event);
      if (!matches) {
        continue;
      }

      console.log(`✅ Rule matched: "${rule.name}" (${rule.id})`);

      // Get actions from the rule
      const actions: AutomationAction[] = typeof rule.actions === 'string'
        ? JSON.parse(rule.actions)
        : rule.actions || [];

      // Process each action
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        if (action.delay_minutes && action.delay_minutes > 0) {
          // Schedule for later execution
          await scheduleAction(rule.id, i, action, event);
          results.push({
            success: true,
            action: action.type,
            message: `Scheduled for ${action.delay_minutes} minutes from now`,
          });
        } else {
          // Execute immediately
          const result = await executeAction(rule, action, event);
          results.push(result);
        }
      }

      // Update rule run count
      await updateRuleRunCount(rule.id);
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
 * Get active rules for a specific trigger type and team
 */
async function getActiveRulesForTrigger(
  triggerType: TriggerType,
  teamId: string
): Promise<AutomationRule[]> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'SELECT * FROM automation_rules WHERE team_id = $1 AND trigger_type = $2 AND is_active = true',
      [teamId, triggerType]
    );
    return (result.rows as AutomationRule[]) || [];
  } else {
    const db = getAutomationDb();
    return db.prepare(`
      SELECT * FROM automation_rules
      WHERE team_id = ? AND trigger_type = ? AND is_active = 1
    `).all(teamId, triggerType) as AutomationRule[];
  }
}

/**
 * Update rule run count after execution
 */
async function updateRuleRunCount(ruleId: string): Promise<void> {
  const now = new Date().toISOString();
  if (IS_PRODUCTION && pgPool) {
    await pgPool.query(
      'UPDATE automation_rules SET run_count = run_count + 1, last_run_at = $1, updated_at = $2 WHERE id = $3',
      [now, now, ruleId]
    );
  } else {
    const db = getAutomationDb();
    db.prepare(`
      UPDATE automation_rules
      SET run_count = run_count + 1, last_run_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, ruleId);
  }
}

// ============================================
// TRIGGER MATCHING
// ============================================

/**
 * Check if a rule's trigger conditions match the event
 */
function checkTriggerMatch(rule: AutomationRule, event: TriggerEvent): boolean {
  const config = typeof rule.trigger_config === 'string'
    ? JSON.parse(rule.trigger_config || '{}')
    : rule.trigger_config || {};

  switch (rule.trigger_type) {
    case 'lead_score_changed':
      // Check if score meets threshold
      if (config.score_threshold && event.data.newScore !== undefined) {
        return event.data.newScore >= config.score_threshold;
      }
      return true;

    case 'deal_stage_changed':
      // Check if stage matches specific stage
      if (config.stage_id && event.data.newStage !== config.stage_id) {
        return false;
      }
      return true;

    case 'deal_won':
    case 'deal_lost':
      // These always match if trigger type matches
      return true;

    case 'tag_added':
      // Check if specific tag was added
      if (config.tag_id && event.data.tagId !== config.tag_id) {
        return false;
      }
      return true;

    case 'no_response':
      // This is typically checked by a scheduled job
      // The config would specify days_no_response
      return true;

    case 'lead_created':
    case 'contact_created':
    case 'deal_created':
    case 'form_submitted':
    case 'booking_scheduled':
      // These triggers match immediately without additional conditions
      return true;

    default:
      return true;
  }
}

// ============================================
// ACTION EXECUTION
// ============================================

/**
 * Execute a single action
 */
async function executeAction(
  rule: AutomationRule,
  action: AutomationAction,
  event: TriggerEvent
): Promise<ActionResult> {
  const logId = uuidv4();

  try {
    // Build template variables from event context
    const variables = buildTemplateVariables(event);

    let result: ActionResult;

    switch (action.type) {
      case 'send_sms':
        result = await executeSendSMS(action.config, event, variables);
        break;

      case 'send_email':
        result = await executeSendEmail(action.config, event, variables);
        break;

      case 'create_task':
        result = await executeCreateTask(action.config, event, variables);
        break;

      case 'update_stage':
        result = await executeUpdateStage(action.config, event);
        break;

      case 'add_tag':
        result = await executeAddTag(action.config, event);
        break;

      case 'remove_tag':
        result = await executeRemoveTag(action.config, event);
        break;

      case 'notify_team':
        result = await executeNotifyTeam(action.config, event, variables);
        break;

      case 'webhook':
        result = await executeWebhook(action.config, event, variables);
        break;

      default:
        result = {
          success: false,
          action: action.type,
          error: `Unknown action type: ${action.type}`,
        };
    }

    // Log the action execution
    await logActionExecution({
      id: logId,
      rule_id: rule.id,
      trigger_type: rule.trigger_type,
      entity_type: event.data.contactId ? 'contact' : event.data.leadId ? 'lead' : event.data.dealId ? 'deal' : undefined,
      entity_id: event.data.contactId || event.data.leadId || event.data.dealId,
      action_type: action.type,
      status: result.success ? 'success' : 'failed',
      result: result,
      error_message: result.error,
    });

    return result;
  } catch (error: any) {
    console.error(`❌ Failed to execute action for rule ${rule.id}:`, error);

    // Log the failure
    await logActionExecution({
      id: logId,
      rule_id: rule.id,
      trigger_type: rule.trigger_type,
      entity_type: event.data.contactId ? 'contact' : event.data.leadId ? 'lead' : event.data.dealId ? 'deal' : undefined,
      entity_id: event.data.contactId || event.data.leadId || event.data.dealId,
      action_type: action.type,
      status: 'failed',
      error_message: error.message,
    });

    return {
      success: false,
      action: action.type,
      error: error.message,
    };
  }
}

/**
 * Log action execution to automation_logs
 */
async function logActionExecution(log: Partial<AutomationLog>): Promise<void> {
  try {
    const now = new Date().toISOString();
    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        `INSERT INTO automation_logs (
          id, rule_id, trigger_type, entity_type, entity_id,
          action_type, status, result, error_message, executed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          log.id, log.rule_id, log.trigger_type,
          log.entity_type || null, log.entity_id || null,
          log.action_type, log.status,
          log.result ? JSON.stringify(log.result) : null,
          log.error_message || null, now
        ]
      );
    } else {
      const db = getAutomationDb();
      db.prepare(`
        INSERT INTO automation_logs (
          id, rule_id, trigger_type, entity_type, entity_id,
          action_type, status, result, error_message, executed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        log.id, log.rule_id, log.trigger_type,
        log.entity_type || null, log.entity_id || null,
        log.action_type, log.status,
        log.result ? JSON.stringify(log.result) : null,
        log.error_message || null, now
      );
    }
  } catch (error) {
    console.error('Failed to log automation action:', error);
  }
}

// ============================================
// INDIVIDUAL ACTION EXECUTORS
// ============================================

/**
 * Send SMS action
 */
async function executeSendSMS(
  config: any,
  event: TriggerEvent,
  variables: TemplateVariables
): Promise<ActionResult> {
  // Determine recipient phone number
  const phone = event.data.contact?.phone || event.data.lead?.phone || event.data.fromNumber;
  if (!phone) {
    return {
      success: false,
      action: 'send_sms',
      error: 'No phone number available',
    };
  }

  // Get message content - from template or inline
  let message = config.message || '';
  if (config.template_id) {
    const template = await getTemplate(config.template_id);
    if (template) {
      message = template.body;
    }
  }

  if (!message) {
    return {
      success: false,
      action: 'send_sms',
      error: 'No message content',
    };
  }

  // Interpolate template variables
  message = interpolateTemplate(message, variables);

  // Send SMS via Twilio
  const result = await sendSMS({
    to: phone,
    body: message,
  });

  // Log communication if successful
  if (result.success) {
    await logCommunication({
      teamId: event.teamId,
      type: 'sms',
      direction: 'outbound',
      contactId: event.data.contactId,
      leadId: event.data.leadId,
      dealId: event.data.dealId,
      toAddress: phone,
      fromAddress: process.env.TWILIO_PHONE_NUMBER,
      body: message,
      status: 'sent',
      externalId: result.messageSid,
    });
  }

  return {
    success: result.success,
    action: 'send_sms',
    message: result.success ? `SMS sent to ${phone}` : `Failed: ${result.error}`,
    error: result.error,
    externalId: result.messageSid,
  };
}

/**
 * Send Email action
 */
async function executeSendEmail(
  config: any,
  event: TriggerEvent,
  variables: TemplateVariables
): Promise<ActionResult> {
  // Determine recipient email
  const email = event.data.contact?.email || event.data.lead?.email;
  if (!email) {
    return {
      success: false,
      action: 'send_email',
      error: 'No email address available',
    };
  }

  // Get content - from template or inline
  let subject = config.subject || 'Notification from Leadly';
  let body = config.body || '';

  if (config.template_id) {
    const template = await getTemplate(config.template_id);
    if (template) {
      subject = template.subject || subject;
      body = template.body;
    }
  }

  if (!body) {
    return {
      success: false,
      action: 'send_email',
      error: 'No email content',
    };
  }

  // Interpolate template variables
  subject = interpolateTemplate(subject, variables);
  body = interpolateTemplate(body, variables);

  // Send email via Postmark
  const result = await sendEmail({
    to: email,
    subject: subject,
    htmlBody: body,
    textBody: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  });

  // Log communication if successful
  if (result.success) {
    await logCommunication({
      teamId: event.teamId,
      type: 'email',
      direction: 'outbound',
      contactId: event.data.contactId,
      leadId: event.data.leadId,
      dealId: event.data.dealId,
      toAddress: email,
      fromAddress: process.env.POSTMARK_FROM_EMAIL,
      subject,
      body,
      status: 'sent',
      externalId: result.messageId,
    });
  }

  return {
    success: result.success,
    action: 'send_email',
    message: result.success ? `Email sent to ${email}` : `Failed: ${result.error}`,
    error: result.error,
    externalId: result.messageId,
  };
}

/**
 * Create Task action
 */
async function executeCreateTask(
  config: any,
  event: TriggerEvent,
  variables: TemplateVariables
): Promise<ActionResult> {
  try {
    const taskId = uuidv4();
    const taskTitle = interpolateTemplate(config.task_title || 'Follow up', variables);
    const dueDays = config.due_days || 1;
    const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);
    const now = new Date().toISOString();

    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        `INSERT INTO activities (
          id, team_id, type, title, contact_id, deal_id,
          assigned_to, due_date, priority, status, created_at, updated_at
        ) VALUES ($1, $2, 'task', $3, $4, $5, $6, $7, $8, 'pending', $9, $10)`,
        [
          taskId, event.teamId, taskTitle,
          event.data.contactId || null, event.data.dealId || null,
          config.task_assignee || null, dueDate.toISOString(),
          config.priority || 'medium', now, now
        ]
      );
    } else {
      const Database = require('better-sqlite3');
      const path = require('path');
      const mainDb = new Database(path.join(process.cwd(), 'data', 'leadly.db'));

      mainDb.prepare(`
        INSERT INTO activities (
          id, team_id, type, title, contact_id, deal_id,
          assigned_to, due_date, priority, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        taskId, event.teamId, 'task', taskTitle,
        event.data.contactId || null, event.data.dealId || null,
        config.task_assignee || null, dueDate.toISOString(),
        config.priority || 'medium', 'pending', now, now
      );
    }

    console.log(`✅ Task created: "${taskTitle}"`);
    return {
      success: true,
      action: 'create_task',
      message: `Task "${taskTitle}" created`,
    };
  } catch (error: any) {
    return {
      success: false,
      action: 'create_task',
      error: error.message,
    };
  }
}

/**
 * Update Stage action
 */
async function executeUpdateStage(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  const newStage = config.stage_id;

  if (!newStage) {
    return {
      success: false,
      action: 'update_stage',
      error: 'No stage specified',
    };
  }

  if (!event.data.dealId) {
    return {
      success: false,
      action: 'update_stage',
      error: 'No deal ID in context',
    };
  }

  try {
    const now = new Date().toISOString();

    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        'UPDATE deals SET stage = $1, updated_at = $2 WHERE id = $3',
        [newStage, now, event.data.dealId]
      );
    } else {
      const Database = require('better-sqlite3');
      const path = require('path');
      const mainDb = new Database(path.join(process.cwd(), 'data', 'leadly.db'));

      mainDb.prepare(`
        UPDATE deals SET stage = ?, updated_at = ? WHERE id = ?
      `).run(newStage, now, event.data.dealId);
    }

    return {
      success: true,
      action: 'update_stage',
      message: `Deal stage updated to "${newStage}"`,
    };
  } catch (error: any) {
    return {
      success: false,
      action: 'update_stage',
      error: error.message,
    };
  }
}

/**
 * Add Tag action
 */
async function executeAddTag(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  const tagId = config.tag_id;

  if (!tagId) {
    return {
      success: false,
      action: 'add_tag',
      error: 'No tag ID specified',
    };
  }

  if (!event.data.contactId) {
    return {
      success: false,
      action: 'add_tag',
      error: 'No contact ID in context',
    };
  }

  try {
    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [event.data.contactId, tagId]
      );
    } else {
      const Database = require('better-sqlite3');
      const path = require('path');
      const mainDb = new Database(path.join(process.cwd(), 'data', 'leadly.db'));

      mainDb.prepare(`
        INSERT OR IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)
      `).run(event.data.contactId, tagId);
    }

    return {
      success: true,
      action: 'add_tag',
      message: 'Tag added to contact',
    };
  } catch (error: any) {
    return {
      success: false,
      action: 'add_tag',
      error: error.message,
    };
  }
}

/**
 * Remove Tag action
 */
async function executeRemoveTag(
  config: any,
  event: TriggerEvent
): Promise<ActionResult> {
  const tagId = config.tag_id;

  if (!tagId) {
    return {
      success: false,
      action: 'remove_tag',
      error: 'No tag ID specified',
    };
  }

  if (!event.data.contactId) {
    return {
      success: false,
      action: 'remove_tag',
      error: 'No contact ID in context',
    };
  }

  try {
    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        'DELETE FROM contact_tags WHERE contact_id = $1 AND tag_id = $2',
        [event.data.contactId, tagId]
      );
    } else {
      const Database = require('better-sqlite3');
      const path = require('path');
      const mainDb = new Database(path.join(process.cwd(), 'data', 'leadly.db'));

      mainDb.prepare(`
        DELETE FROM contact_tags WHERE contact_id = ? AND tag_id = ?
      `).run(event.data.contactId, tagId);
    }

    return {
      success: true,
      action: 'remove_tag',
      message: 'Tag removed from contact',
    };
  } catch (error: any) {
    return {
      success: false,
      action: 'remove_tag',
      error: error.message,
    };
  }
}

/**
 * Notify Team action
 */
async function executeNotifyTeam(
  config: any,
  event: TriggerEvent,
  variables: TemplateVariables
): Promise<ActionResult> {
  const message = interpolateTemplate(
    config.message || 'New automation notification',
    variables
  );

  console.log('🔔 [AUTOMATION] Team notification:', {
    teamId: event.teamId,
    message,
    channel: config.notification_channel,
  });

  // If Slack webhook is configured, send there
  if (config.slack_webhook) {
    try {
      await fetch(config.slack_webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (e) {
      console.error('Slack notification failed:', e);
    }
  }

  return {
    success: true,
    action: 'notify_team',
    message: 'Team notified',
  };
}

/**
 * Webhook action
 */
async function executeWebhook(
  config: any,
  event: TriggerEvent,
  variables: TemplateVariables
): Promise<ActionResult> {
  const webhookUrl = config.webhook_url;

  if (!webhookUrl) {
    return {
      success: false,
      action: 'webhook',
      error: 'No webhook URL specified',
    };
  }

  try {
    const payload = {
      trigger: event.type,
      teamId: event.teamId,
      data: event.data,
      variables,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return {
        success: true,
        action: 'webhook',
        message: `Webhook called: ${response.status}`,
      };
    } else {
      return {
        success: false,
        action: 'webhook',
        error: `Webhook returned ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      action: 'webhook',
      error: error.message,
    };
  }
}

// ============================================
// SCHEDULING
// ============================================

/**
 * Schedule an action for later execution
 */
async function scheduleAction(
  ruleId: string,
  actionIndex: number,
  action: AutomationAction,
  event: TriggerEvent
): Promise<void> {
  const scheduledFor = new Date(Date.now() + (action.delay_minutes || 0) * 60 * 1000);
  const queueId = uuidv4();
  const now = new Date().toISOString();

  const context = {
    type: event.type,
    teamId: event.teamId,
    data: event.data,
    action: action,
  };

  if (IS_PRODUCTION && pgPool) {
    await pgPool.query(
      `INSERT INTO automation_queue (
        id, rule_id, action_index, entity_type, entity_id,
        context, scheduled_for, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
      [
        queueId, ruleId, actionIndex,
        event.data.contactId ? 'contact' : event.data.leadId ? 'lead' : event.data.dealId ? 'deal' : null,
        event.data.contactId || event.data.leadId || event.data.dealId || null,
        JSON.stringify(context), scheduledFor.toISOString(), now
      ]
    );
  } else {
    const db = getAutomationDb();
    db.prepare(`
      INSERT INTO automation_queue (
        id, rule_id, action_index, entity_type, entity_id,
        context, scheduled_for, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      queueId, ruleId, actionIndex,
      event.data.contactId ? 'contact' : event.data.leadId ? 'lead' : event.data.dealId ? 'deal' : null,
      event.data.contactId || event.data.leadId || event.data.dealId || null,
      JSON.stringify(context), scheduledFor.toISOString(), 'pending', now
    );
  }

  console.log(`⏰ [AUTOMATION] Action scheduled for ${scheduledFor.toISOString()}`);
}

/**
 * Process all pending scheduled actions (called by cron job or API)
 */
export async function processScheduledActions(): Promise<{ processed: number; failed: number }> {
  const result = { processed: 0, failed: 0 };
  const now = new Date().toISOString();

  try {
    let pendingItems: any[] = [];

    if (IS_PRODUCTION && pgPool) {
      const result = await pgPool.query(
        `SELECT q.*, r.name as rule_name, r.trigger_type
        FROM automation_queue q
        JOIN automation_rules r ON q.rule_id = r.id
        WHERE q.status = 'pending' AND q.scheduled_for <= $1
        ORDER BY q.scheduled_for ASC
        LIMIT 100`,
        [now]
      );
      pendingItems = result.rows;
    } else {
      const db = getAutomationDb();
      pendingItems = db.prepare(`
        SELECT q.*, r.name as rule_name, r.trigger_type
        FROM automation_queue q
        JOIN automation_rules r ON q.rule_id = r.id
        WHERE q.status = 'pending' AND q.scheduled_for <= ?
        ORDER BY q.scheduled_for ASC
        LIMIT 100
      `).all(now) as any[];
    }

    console.log(`⏰ Processing ${pendingItems.length} scheduled automation actions`);

    for (const item of pendingItems) {
      try {
        // Mark as processing
        await updateQueueStatus(item.id, 'processing');

        // Parse context
        const context = typeof item.context === 'string'
          ? JSON.parse(item.context)
          : item.context;

        // Build the event and action from context
        const event: TriggerEvent = {
          type: context.type,
          teamId: context.teamId,
          data: context.data,
        };

        const action: AutomationAction = context.action;
        const rule: AutomationRule = {
          id: item.rule_id,
          team_id: context.teamId,
          name: item.rule_name,
          trigger_type: item.trigger_type,
          trigger_config: {},
          actions: [],
          is_active: true,
          run_count: 0,
          created_at: '',
          updated_at: '',
        };

        // Execute the action
        const actionResult = await executeAction(rule, action, event);

        // Update queue status
        await updateQueueStatus(
          item.id,
          actionResult.success ? 'completed' : 'failed',
          new Date().toISOString()
        );

        if (actionResult.success) {
          result.processed++;
        } else {
          result.failed++;
        }
      } catch (error: any) {
        await updateQueueStatus(item.id, 'failed', new Date().toISOString());
        result.failed++;
        console.error(`Failed to process queue item ${item.id}:`, error);
      }
    }
  } catch (error: any) {
    console.error('Error processing scheduled actions:', error);
  }

  return result;
}

/**
 * Update queue item status
 */
async function updateQueueStatus(
  queueId: string,
  status: string,
  processedAt?: string
): Promise<void> {
  if (IS_PRODUCTION && pgPool) {
    if (processedAt) {
      await pgPool.query(
        'UPDATE automation_queue SET status = $1, last_attempt_at = $2, attempts = attempts + 1 WHERE id = $3',
        [status, processedAt, queueId]
      );
    } else {
      await pgPool.query(
        'UPDATE automation_queue SET status = $1 WHERE id = $2',
        [status, queueId]
      );
    }
  } else {
    const db = getAutomationDb();
    if (processedAt) {
      db.prepare(`
        UPDATE automation_queue
        SET status = ?, last_attempt_at = ?, attempts = attempts + 1
        WHERE id = ?
      `).run(status, processedAt, queueId);
    } else {
      db.prepare(`UPDATE automation_queue SET status = ? WHERE id = ?`).run(status, queueId);
    }
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Get a message template by ID
 */
async function getTemplate(templateId: string): Promise<any | null> {
  if (IS_PRODUCTION && pgPool) {
    const result = await pgPool.query(
      'SELECT * FROM automation_templates WHERE id = $1',
      [templateId]
    );
    return result.rows?.[0] || null;
  } else {
    const db = getAutomationDb();
    return db.prepare('SELECT * FROM automation_templates WHERE id = ?').get(templateId);
  }
}

/**
 * Build template variables from event context
 */
function buildTemplateVariables(event: TriggerEvent): TemplateVariables {
  const contact = event.data.contact;
  const lead = event.data.lead;
  const deal = event.data.deal;

  return {
    // Lead fields
    business_name: lead?.business_name,
    contact_name: lead?.contact_name ||
      (contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : undefined),
    score: lead?.score,

    // Contact fields
    first_name: contact?.first_name,
    last_name: contact?.last_name,
    email: contact?.email || lead?.email,
    phone: contact?.phone || lead?.phone,
    company: contact?.company,

    // Deal fields
    deal_name: deal?.name,
    deal_value: deal?.value,
    stage: deal?.stage || event.data.newStage,

    // Booking fields
    booking_time: event.data.bookingData?.start_time,
    booking_link: process.env.NEXT_PUBLIC_CALENDLY_URL || '/booking',

    // Default team name
    team_name: 'Leadly',
  };
}

/**
 * Interpolate template variables into a string
 * Replaces {{variable_name}} with actual values
 */
export function interpolateTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Log communication to the communications table
 */
async function logCommunication(comm: {
  teamId: string;
  type: 'sms' | 'email' | 'call';
  direction: 'inbound' | 'outbound';
  contactId?: string;
  leadId?: string;
  dealId?: string;
  toAddress?: string;
  fromAddress?: string;
  subject?: string;
  body?: string;
  status: string;
  externalId?: string;
}): Promise<void> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();

    if (IS_PRODUCTION && pgPool) {
      await pgPool.query(
        `INSERT INTO communications (
          id, team_id, type, direction, contact_id, lead_id, deal_id,
          from_address, to_address, subject, body, status, external_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id, comm.teamId, comm.type, comm.direction,
          comm.contactId || null, comm.leadId || null, comm.dealId || null,
          comm.fromAddress || null, comm.toAddress || null,
          comm.subject || null, comm.body || null,
          comm.status, comm.externalId || null, now
        ]
      );
    } else {
      const Database = require('better-sqlite3');
      const path = require('path');
      const mainDb = new Database(path.join(process.cwd(), 'data', 'leadly.db'));

      mainDb.prepare(`
        INSERT INTO communications (
          id, team_id, type, direction, contact_id, lead_id, deal_id,
          from_address, to_address, subject, body, status, external_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, comm.teamId, comm.type, comm.direction,
        comm.contactId || null, comm.leadId || null, comm.dealId || null,
        comm.fromAddress || null, comm.toAddress || null,
        comm.subject || null, comm.body || null,
        comm.status, comm.externalId || null, now
      );
    }
  } catch (error) {
    console.error('Failed to log communication:', error);
  }
}

// ============================================
// TRIGGER HELPERS (for use by other modules)
// ============================================

/**
 * Helper: Trigger automation for lead created
 */
export async function triggerLeadCreatedAutomation(params: {
  teamId: string;
  leadId: string;
  lead?: TriggerEvent['data']['lead'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'lead_created',
    teamId: params.teamId,
    data: {
      leadId: params.leadId,
      lead: params.lead,
    },
  });
}

/**
 * Helper: Trigger automation for contact created
 */
export async function triggerContactCreatedAutomation(params: {
  teamId: string;
  contactId: string;
  contact?: TriggerEvent['data']['contact'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'contact_created',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
      contact: params.contact,
    },
  });
}

/**
 * Helper: Trigger automation for deal stage changed
 */
export async function triggerDealStageAutomation(params: {
  teamId: string;
  dealId: string;
  contactId?: string;
  previousStage: string;
  newStage: string;
  deal?: TriggerEvent['data']['deal'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'deal_stage_changed',
    teamId: params.teamId,
    data: {
      dealId: params.dealId,
      contactId: params.contactId,
      previousStage: params.previousStage,
      newStage: params.newStage,
      deal: params.deal,
    },
  });
}

/**
 * Helper: Trigger automation for deal won
 */
export async function triggerDealWonAutomation(params: {
  teamId: string;
  dealId: string;
  contactId?: string;
  deal?: TriggerEvent['data']['deal'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'deal_won',
    teamId: params.teamId,
    data: {
      dealId: params.dealId,
      contactId: params.contactId,
      deal: params.deal,
    },
  });
}

/**
 * Helper: Trigger automation for booking scheduled
 */
export async function triggerBookingAutomation(params: {
  teamId: string;
  bookingId: string;
  contactId?: string;
  leadId?: string;
  contact?: TriggerEvent['data']['contact'];
  bookingData?: TriggerEvent['data']['bookingData'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'booking_scheduled',
    teamId: params.teamId,
    data: {
      bookingId: params.bookingId,
      contactId: params.contactId,
      leadId: params.leadId,
      contact: params.contact,
      bookingData: params.bookingData,
    },
  });
}

/**
 * Helper: Trigger automation for form submitted
 */
export async function triggerFormSubmittedAutomation(params: {
  teamId: string;
  contactId?: string;
  leadId?: string;
  contact?: TriggerEvent['data']['contact'];
  formData?: Record<string, any>;
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'form_submitted',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
      leadId: params.leadId,
      contact: params.contact,
      formData: params.formData,
    },
  });
}

/**
 * Helper: Trigger automation for tag added
 */
export async function triggerTagAddedAutomation(params: {
  teamId: string;
  contactId: string;
  tagId: string;
  tagName?: string;
  contact?: TriggerEvent['data']['contact'];
}): Promise<ActionResult[]> {
  return processAutomations({
    type: 'tag_added',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
      tagId: params.tagId,
      tagName: params.tagName,
      contact: params.contact,
    },
  });
}

/**
 * Helper: Trigger automation for SMS received (legacy support)
 * Used by the Twilio SMS webhook
 */
export async function triggerSMSAutomation(params: {
  teamId: string;
  contactId?: string;
  fromNumber: string;
  toNumber: string;
  smsBody: string;
}): Promise<ActionResult[]> {
  // For SMS received, we use form_submitted as a generic trigger
  // In the future, we could add a dedicated 'sms_received' trigger type
  return processAutomations({
    type: 'form_submitted',
    teamId: params.teamId,
    data: {
      contactId: params.contactId,
      fromNumber: params.fromNumber,
      toNumber: params.toNumber,
      smsBody: params.smsBody,
      formData: {
        type: 'sms_received',
        from: params.fromNumber,
        body: params.smsBody,
      },
    },
  });
}
