import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * POST /api/copilot/analyze-call
 *
 * Analyzes a call transcript and provides insights
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, duration, outcome } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return basic analysis without AI
      return NextResponse.json({
        insights: generateFallbackInsights(transcript, duration, outcome),
        suggested_actions: generateFallbackActions(outcome),
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Call Claude API for analysis
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: `You are an expert sales coach analyzing sales calls. Provide actionable insights.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this sales call transcript and provide:
1. 2-3 key insights about the conversation
2. What went well
3. Areas for improvement
4. 3-5 specific next action items

Call Duration: ${Math.floor(duration / 60)}m ${duration % 60}s
Call Outcome: ${outcome}

Transcript:
${transcript}

Keep your response concise and actionable. Format as plain text with clear sections.`,
        },
      ],
    });

    const analysisText = response.content[0];
    const insights = analysisText.type === 'text' ? analysisText.text : '';

    // Extract suggested actions from the insights
    const suggestedActions = extractActions(insights);

    return NextResponse.json({
      insights,
      suggested_actions: suggestedActions,
    });

  } catch (error) {
    console.error('Call analysis error:', error);

    // Fallback to basic analysis
    const body = await request.json();
    return NextResponse.json({
      insights: generateFallbackInsights(body.transcript, body.duration, body.outcome),
      suggested_actions: generateFallbackActions(body.outcome),
    });
  }
}

function extractActions(text: string): string[] {
  const actions: string[] = [];
  const lines = text.split('\n');

  let inActionSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('action') || line.toLowerCase().includes('next step')) {
      inActionSection = true;
      continue;
    }

    if (inActionSection && line.trim()) {
      // Extract action items (lines that start with numbers, bullets, or dashes)
      const cleaned = line.replace(/^[\d\-•\*\s]+/, '').trim();
      if (cleaned && cleaned.length > 10) {
        actions.push(cleaned);
      }
    }
  }

  return actions.slice(0, 5); // Return max 5 actions
}

function generateFallbackInsights(transcript: string, duration: number, outcome: string): string {
  const minutes = Math.floor(duration / 60);
  const wordCount = transcript.split(' ').length;
  const talkSpeed = wordCount / (duration / 60);

  let insights = `Call Analysis:\n\n`;

  insights += `Duration: ${minutes} minutes\n`;
  insights += `Outcome: ${outcome}\n`;
  insights += `Conversation Length: ${wordCount} words (${Math.round(talkSpeed)} words/min)\n\n`;

  if (outcome === 'connected' || outcome === 'meeting_scheduled') {
    insights += `✓ Positive outcome - good engagement with prospect\n`;
    insights += `✓ Focus on following up promptly to maintain momentum\n`;
  } else if (outcome === 'not_interested') {
    insights += `• Prospect declined - consider if this is a timing issue or a fit issue\n`;
    insights += `• Review what objections were raised to improve future pitches\n`;
  } else if (outcome === 'no_answer' || outcome === 'voicemail') {
    insights += `• No contact made - try different times or channels\n`;
    insights += `• Consider sending a pre-call email or text\n`;
  }

  insights += `\nRecommendations:\n`;
  insights += `• Document key points in CRM for team visibility\n`;
  insights += `• Set appropriate follow-up reminders\n`;
  insights += `• Review call recording if available for quality improvement\n`;

  return insights;
}

function generateFallbackActions(outcome: string): string[] {
  const actionMap: Record<string, string[]> = {
    connected: [
      'Send follow-up email summarizing discussion',
      'Add prospect to nurture sequence',
      'Schedule next touchpoint in calendar',
    ],
    meeting_scheduled: [
      'Send calendar invite with meeting details',
      'Prepare custom demo/presentation',
      'Send pre-meeting agenda email',
    ],
    not_interested: [
      'Log objections in CRM for future reference',
      'Add to long-term nurture campaign',
      'Review pitch approach for similar prospects',
    ],
    no_answer: [
      'Schedule callback at different time',
      'Send introductory email or LinkedIn message',
      'Try alternate phone number if available',
    ],
    voicemail: [
      'Log voicemail left in CRM',
      'Follow up with email referencing voicemail',
      'Schedule second call attempt',
    ],
    callback_requested: [
      'Schedule callback at requested time',
      'Send confirmation email/text',
      'Prepare for callback with research',
    ],
  };

  return actionMap[outcome] || [
    'Log call details in CRM',
    'Determine appropriate next steps',
    'Update lead status based on outcome',
  ];
}
