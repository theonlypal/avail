import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    // Check if lead info was collected (simple detection)
    const leadCaptured = detectLeadInfo(response, messages);

    return NextResponse.json({
      message: response,
      leadCaptured
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

function detectLeadInfo(response: string, messages: any[]) {
  // Check if we've collected name, phone, and issue
  const allMessages = messages.map(m => m.content).join(' ').toLowerCase();

  const hasName = /my name is|i'm|i am|this is/i.test(allMessages);
  const hasPhone = /\d{3}[-.)]\s*\d{3}[-.)]\s*\d{4}|\(\d{3}\)\s*\d{3}-\d{4}/i.test(allMessages);
  const hasIssue = /leak|water heater|drain|emergency|plumb/i.test(allMessages);

  return {
    captured: hasName && hasPhone && hasIssue,
    data: {
      hasName,
      hasPhone,
      hasIssue
    }
  };
}
