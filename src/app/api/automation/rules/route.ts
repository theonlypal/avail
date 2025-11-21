/**
 * Automation Rules API - PRODUCTION READY
 *
 * GET /api/automation/rules - List automation rules for a team
 * POST /api/automation/rules - Create new automation rule
 * PUT /api/automation/rules - Update existing automation rule
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAutomationRule,
  getAutomationRulesByTeam,
  updateAutomationRule,
  type AutomationRule,
} from '@/lib/db-crm';

/**
 * GET /api/automation/rules
 * Query params:
 *  - teamId: filter by team (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId query parameter is required' },
        { status: 400 }
      );
    }

    const rules = await getAutomationRulesByTeam(teamId);

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error: any) {
    console.error('❌ GET /api/automation/rules error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation/rules
 * Body: {
 *   team_id: string,
 *   name: string,
 *   trigger_type: string,
 *   trigger_value?: string,
 *   action_type: string,
 *   action_config: object,
 *   is_active?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.team_id || !data.name || !data.trigger_type || !data.action_type || !data.action_config) {
      return NextResponse.json(
        { error: 'Missing required fields: team_id, name, trigger_type, action_type, action_config' },
        { status: 400 }
      );
    }

    const rule = await createAutomationRule({
      team_id: data.team_id,
      name: data.name,
      trigger_type: data.trigger_type,
      trigger_value: data.trigger_value,
      action_type: data.action_type,
      action_config: data.action_config,
      is_active: data.is_active !== undefined ? data.is_active : true,
    });

    console.log('✅ Automation rule created:', rule.id);

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('❌ POST /api/automation/rules error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/automation/rules
 * Body: {
 *   id: string,
 *   name?: string,
 *   trigger_type?: string,
 *   trigger_value?: string,
 *   action_type?: string,
 *   action_config?: object,
 *   is_active?: boolean
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    await updateAutomationRule(data.id, {
      name: data.name,
      trigger_type: data.trigger_type,
      trigger_value: data.trigger_value,
      action_type: data.action_type,
      action_config: data.action_config,
      is_active: data.is_active,
    });

    console.log('✅ Automation rule updated:', data.id);

    return NextResponse.json({
      success: true,
      message: 'Automation rule updated successfully',
    });
  } catch (error: any) {
    console.error('❌ PUT /api/automation/rules error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update automation rule' },
      { status: 500 }
    );
  }
}
