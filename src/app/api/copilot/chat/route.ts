import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * POST /api/copilot/chat
 *
 * Real-time AI assistant during calls
 * Provides contextual coaching and answers questions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback response if no API key
      return NextResponse.json({
        response: getFallbackResponse(message, context),
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const assistantMessage = response.content[0];
    const responseText = assistantMessage.type === 'text' ? assistantMessage.text : 'I can help you with that!';

    return NextResponse.json({
      response: responseText,
    });

  } catch (error) {
    console.error('Copilot API error:', error);

    // Return fallback response on error
    const body = await request.json();
    return NextResponse.json({
      response: getFallbackResponse(body.message, body.context),
    });
  }
}

function buildSystemPrompt(context: any): string {
  const { lead, transcript, callStatus, callDuration } = context || {};

  let prompt = `You are an expert sales coach AI assistant helping a salesperson during a live phone call.

Your role:
- Provide real-time coaching and advice
- Answer questions about the lead and conversation
- Suggest effective responses and techniques
- Help overcome objections
- Keep responses concise and actionable (2-3 sentences max)

Current Context:`;

  if (lead) {
    prompt += `

Lead Information:
- Business: ${lead.business_name}
- Industry: ${lead.industry}
- Location: ${lead.location}
- Opportunity Score: ${lead.opportunity_score}/100
- Rating: ${lead.rating || 'N/A'}`;

    if (lead.pain_points && lead.pain_points.length > 0) {
      prompt += `\n- Pain Points: ${lead.pain_points.join(', ')}`;
    }
  }

  if (callStatus) {
    prompt += `\n\nCall Status: ${callStatus}`;
  }

  if (callDuration) {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    prompt += `\nCall Duration: ${minutes}m ${seconds}s`;
  }

  if (transcript && transcript.length > 0) {
    prompt += `\n\nRecent Conversation:\n${transcript}`;
  }

  prompt += `\n\nProvide practical, actionable advice. Be encouraging but direct.`;

  return prompt;
}

function getFallbackResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();

  // Detect question type and provide helpful responses
  if (lowerMessage.includes('what should i say') || lowerMessage.includes('what to say')) {
    return `Based on your conversation so far, try transitioning to their pain points. Ask: "Are you currently happy with how customers are finding you online?" This opens the door to discuss their digital presence challenges.`;
  }

  if (lowerMessage.includes('objection') || lowerMessage.includes('handle')) {
    return `When handling objections, use the "Feel, Felt, Found" technique: "I understand how you feel. Many business owners have felt the same way. But what they've found is that even small improvements to their online presence can lead to 30% more customer inquiries."`;
  }

  if (lowerMessage.includes('pain point') || lowerMessage.includes('problem')) {
    if (context?.lead?.pain_points && context.lead.pain_points.length > 0) {
      return `This lead's main pain points are: ${context.lead.pain_points.slice(0, 2).join(' and ')}. Focus on how your solution directly addresses these specific challenges.`;
    }
    return `Focus on their low online visibility and missed customer opportunities. Ask about their current website traffic and conversion rates.`;
  }

  if (lowerMessage.includes('close') || lowerMessage.includes('closing')) {
    return `Try a soft close: "Based on what you've shared, I think we could really help increase your customer inquiries. Would you be open to a 15-minute demo next week to see exactly how this would work for your business?"`;
  }

  if (lowerMessage.includes('next') || lowerMessage.includes('continue')) {
    return `Ask an open-ended question to keep them talking: "Tell me more about how customers typically find your business right now?" This helps you understand their current situation and build rapport.`;
  }

  // Default helpful response
  return `I'm here to help during your call! You can ask me:

• "What should I say next?"
• "How do I handle this objection?"
• "What are their pain points?"
• "How do I close this deal?"

Just type your question and I'll provide specific guidance based on your conversation.`;
}
