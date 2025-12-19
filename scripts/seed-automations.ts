/**
 * Seed Pre-built Automation Templates and Rules
 *
 * Run: npx tsx scripts/seed-automations.ts
 */

import { getAutomationDb } from '../src/lib/db-automation';
import { v4 as uuidv4 } from 'uuid';

const TEAM_ID = 'default-team';

// Pre-built message templates
const TEMPLATES = [
  {
    id: uuidv4(),
    name: 'Welcome New Lead',
    type: 'sms',
    body: 'Hi {{contact_name}}! Thanks for your interest in {{business_name}}. We\'d love to learn more about how we can help. When\'s a good time to chat?',
  },
  {
    id: uuidv4(),
    name: 'Follow-up Reminder',
    type: 'sms',
    body: 'Hi {{first_name}}, just checking in! Did you have any questions about our services? I\'m here to help. Reply to this message or book a call: {{booking_link}}',
  },
  {
    id: uuidv4(),
    name: 'Booking Confirmation',
    type: 'sms',
    body: 'Great news, {{first_name}}! Your meeting is confirmed for {{booking_time}}. Looking forward to speaking with you!',
  },
  {
    id: uuidv4(),
    name: 'Deal Won Celebration',
    type: 'sms',
    body: 'Welcome aboard, {{contact_name}}! We\'re thrilled to have you as a customer. Your dedicated team is ready to help you succeed.',
  },
  {
    id: uuidv4(),
    name: 'High Score Alert',
    type: 'email',
    subject: '🔥 Hot Lead Alert: {{business_name}} (Score: {{score}})',
    body: `<h2>New High-Scoring Lead!</h2>
<p><strong>Business:</strong> {{business_name}}</p>
<p><strong>Contact:</strong> {{contact_name}}</p>
<p><strong>Score:</strong> {{score}}</p>
<p>This lead has a high likelihood of conversion. Reach out within 24 hours for best results.</p>
<p><a href="{{booking_link}}">View in CRM</a></p>`,
  },
  {
    id: uuidv4(),
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to {{team_name}}!',
    body: `<h2>Welcome, {{first_name}}!</h2>
<p>Thank you for reaching out to us. We're excited to learn more about your needs and how we can help.</p>
<p>Here's what you can expect:</p>
<ul>
<li>A quick intro call to understand your goals</li>
<li>A customized proposal tailored to your needs</li>
<li>Dedicated support throughout our partnership</li>
</ul>
<p><a href="{{booking_link}}">Book a time to chat</a></p>
<p>Best,<br>The {{team_name}} Team</p>`,
  },
  {
    id: uuidv4(),
    name: 'Meeting Reminder',
    type: 'email',
    subject: 'Reminder: Your meeting is tomorrow',
    body: `<h2>Meeting Reminder</h2>
<p>Hi {{first_name}},</p>
<p>Just a friendly reminder that we have a meeting scheduled for <strong>{{booking_time}}</strong>.</p>
<p>Looking forward to speaking with you!</p>
<p>Best,<br>The {{team_name}} Team</p>`,
  },
];

// Pre-built automation rules
const RULES = [
  {
    id: uuidv4(),
    name: 'Welcome New Leads',
    description: 'Send a welcome SMS when a new lead is created',
    trigger_type: 'lead_created',
    trigger_config: {},
    actions: [
      {
        type: 'send_sms',
        delay_minutes: 0,
        config: {
          message: 'Hi {{contact_name}}! Thanks for your interest. We\'d love to learn more about how we can help. When\'s a good time to chat?',
        },
      },
    ],
    is_active: false, // Start inactive so users can customize
  },
  {
    id: uuidv4(),
    name: 'Follow-up After 2 Days',
    description: 'Send a follow-up SMS if no response after 2 days',
    trigger_type: 'lead_created',
    trigger_config: {},
    actions: [
      {
        type: 'send_sms',
        delay_minutes: 2880, // 2 days
        config: {
          message: 'Hi {{first_name}}, just checking in! Did you have any questions? I\'m here to help.',
        },
      },
    ],
    is_active: false,
  },
  {
    id: uuidv4(),
    name: 'Booking Confirmation',
    description: 'Send confirmation SMS when a meeting is scheduled',
    trigger_type: 'booking_scheduled',
    trigger_config: {},
    actions: [
      {
        type: 'send_sms',
        delay_minutes: 0,
        config: {
          message: 'Great news! Your meeting is confirmed. Looking forward to speaking with you!',
        },
      },
      {
        type: 'create_task',
        delay_minutes: 0,
        config: {
          task_title: 'Prepare for meeting with {{contact_name}}',
          due_days: 1,
        },
      },
    ],
    is_active: false,
  },
  {
    id: uuidv4(),
    name: 'High Score Lead Alert',
    description: 'Notify team when a lead scores 80+',
    trigger_type: 'lead_score_changed',
    trigger_config: { score_threshold: 80 },
    actions: [
      {
        type: 'notify_team',
        delay_minutes: 0,
        config: {
          message: '🔥 Hot Lead Alert! {{business_name}} just scored {{score}}. Reach out now!',
        },
      },
      {
        type: 'create_task',
        delay_minutes: 0,
        config: {
          task_title: 'Call high-score lead: {{business_name}}',
          priority: 'high',
        },
      },
    ],
    is_active: false,
  },
  {
    id: uuidv4(),
    name: 'Deal Won Celebration',
    description: 'Send thank you message when a deal is won',
    trigger_type: 'deal_won',
    trigger_config: {},
    actions: [
      {
        type: 'send_sms',
        delay_minutes: 0,
        config: {
          message: 'Welcome aboard! We\'re thrilled to have you as a customer. Your dedicated team is ready to help you succeed.',
        },
      },
      {
        type: 'add_tag',
        delay_minutes: 0,
        config: {
          tag_name: 'Customer',
        },
      },
    ],
    is_active: false,
  },
  {
    id: uuidv4(),
    name: 'Contact Welcome Sequence',
    description: 'Welcome email sequence for new contacts',
    trigger_type: 'contact_created',
    trigger_config: {},
    actions: [
      {
        type: 'send_email',
        delay_minutes: 0,
        config: {
          subject: 'Welcome!',
          message: '<h2>Welcome!</h2><p>Thank you for connecting with us. We\'re excited to learn more about how we can help.</p>',
        },
      },
      {
        type: 'send_email',
        delay_minutes: 4320, // 3 days
        config: {
          subject: 'Quick question',
          message: '<h2>Hi there!</h2><p>Just wanted to check in and see if you had any questions. We\'re here to help!</p>',
        },
      },
    ],
    is_active: false,
  },
];

async function seedAutomations() {
  console.log('🌱 Seeding automation templates and rules...\n');

  const db = getAutomationDb();
  const now = new Date().toISOString();

  // Seed templates
  console.log('📝 Seeding templates...');
  for (const template of TEMPLATES) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO automation_templates (id, team_id, name, type, subject, body, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        template.id,
        TEAM_ID,
        template.name,
        template.type,
        template.type === 'email' ? (template as any).subject : null,
        template.body,
        now,
        now
      );
      console.log(`  ✅ ${template.name} (${template.type})`);
    } catch (error: any) {
      if (error.message.includes('UNIQUE')) {
        console.log(`  ⏭️  ${template.name} (already exists)`);
      } else {
        console.error(`  ❌ ${template.name}: ${error.message}`);
      }
    }
  }

  // Seed rules
  console.log('\n⚡ Seeding automation rules...');
  for (const rule of RULES) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO automation_rules (
          id, team_id, name, description, trigger_type, trigger_config,
          actions, is_active, run_count, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        rule.id,
        TEAM_ID,
        rule.name,
        rule.description,
        rule.trigger_type,
        JSON.stringify(rule.trigger_config),
        JSON.stringify(rule.actions),
        rule.is_active ? 1 : 0,
        0,
        now,
        now
      );
      console.log(`  ✅ ${rule.name}`);
    } catch (error: any) {
      if (error.message.includes('UNIQUE')) {
        console.log(`  ⏭️  ${rule.name} (already exists)`);
      } else {
        console.error(`  ❌ ${rule.name}: ${error.message}`);
      }
    }
  }

  console.log('\n✨ Seeding complete!\n');
  console.log(`Templates created: ${TEMPLATES.length}`);
  console.log(`Rules created: ${RULES.length}`);
  console.log('\nNote: All rules are created INACTIVE by default.');
  console.log('Go to Settings → Automations to review and activate them.');
}

seedAutomations().catch(console.error);
