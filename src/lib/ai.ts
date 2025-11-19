import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { Lead } from "@/types";
import { readFileSync } from "fs";
import { join } from "path";

const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const anthropicClient = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;

type ScoreResponse = {
  opportunity_score: number;
  pain_points: string[];
  recommended_services: string[];
  ai_summary: string;
};

type OutreachResponse = {
  subject: string;
  body: string;
};

const defaultPainPoints = [
  "No AI on website",
  "Slow lead follow-up",
  "Manual intake",
  "Limited analytics",
];

const defaultServices = ["AI assistant", "Automated SMS", "CRM sync"];

/**
 * Load prompt templates from files
 */
function loadPromptTemplate(name: string): string {
  try {
    const promptPath = join(process.cwd(), "prompts", `${name}.txt`);
    return readFileSync(promptPath, "utf-8");
  } catch (error) {
    console.warn(`Could not load prompt template: ${name}`, error);
    return "";
  }
}

/**
 * Score a lead using AI (OpenAI GPT-4 or Claude)
 */
export async function scoreLeadWithAI(lead: Lead): Promise<ScoreResponse> {
  const promptTemplate = loadPromptTemplate("scoreLead");

  if (openaiClient) {
    try {
      const prompt = promptTemplate
        ? `${promptTemplate}\n\nLead data: ${JSON.stringify(lead)}`
        : `You are Leadly.AI, an expert GTM analyst. Given this lead data, output JSON with keys: opportunity_score (0-100), pain_points (array of short bullet points), recommended_services (array) and ai_summary (string).\n\nLead: ${JSON.stringify(lead)}`;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: promptTemplate || "You are Leadly.AI, a lead scoring expert. Return JSON only.",
          },
          {
            role: "user",
            content: `Lead data: ${JSON.stringify(lead)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("OpenAI scoring failed, falling back to heuristic", error);
    }
  }

  if (anthropicClient) {
    try {
      const result = await anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 300,
        temperature: 0.4,
        system:
          promptTemplate ||
          "You are Leadly.AI, respond with JSON {opportunity_score,pain_points,recommended_services,ai_summary}.",
        messages: [
          {
            role: "user",
            content: `Lead data: ${JSON.stringify(lead)}`,
          },
        ],
      });

      const textContent = result.content.find((block) => block.type === "text");
      if (textContent && "text" in textContent) {
        // Extract JSON from response (may be wrapped in markdown)
        const text = textContent.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.warn("Anthropic scoring failed, falling back to heuristic", error);
    }
  }

  // Heuristic fallback
  const score = Math.min(
    95,
    Math.round(
      (100 - lead.website_score) * 0.3 +
        (lead.review_count < 50 ? 20 : 5) +
        (lead.rating < 4 ? 10 : 5) +
        60
    )
  );

  return {
    opportunity_score: score,
    pain_points: lead.pain_points.length ? lead.pain_points : defaultPainPoints,
    recommended_services: lead.recommended_services.length
      ? lead.recommended_services
      : defaultServices,
    ai_summary:
      lead.ai_summary ||
      "High potential for AI assist due to manual workflows, slow follow-ups, and lack of automation.",
  };
}

/**
 * Generate personalized outreach content (email or SMS)
 */
export async function generateOutreachContent(
  lead: Lead,
  channel: "email" | "sms" = "email"
): Promise<OutreachResponse> {
  const promptTemplate = loadPromptTemplate("outreach");

  const userPrompt = `Generate a ${channel === "email" ? "short email" : "concise SMS"} for ${
    lead.business_name
  } (${lead.industry}) in ${lead.location}. Reference their pain points: ${lead.pain_points.join(
    ", "
  )}. Pitch AI automation that addresses these issues.`;

  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: promptTemplate || "You are an AI SDR for Leadly.AI. Return JSON with subject and body.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("OpenAI outreach failed, using fallback", error);
    }
  }

  if (anthropicClient) {
    try {
      const result = await anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        temperature: 0.7,
        system:
          promptTemplate ||
          'You are an AI SDR for Leadly.AI. Return JSON with "subject" and "body" keys.',
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const textContent = result.content.find((block) => block.type === "text");
      if (textContent && "text" in textContent) {
        const text = textContent.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.warn("Anthropic outreach failed, using fallback", error);
    }
  }

  // Fallback template
  const signature = "– Leadly.AI Copilot";
  const businessName = lead.business_name.split(" ")[0];

  if (channel === "sms") {
    return {
      subject: "",
      body: `Hi ${businessName}, noticed ${lead.business_name} handles leads manually. We can launch an AI concierge this week to answer after-hours calls & qualify leads into GoHighLevel. ${Math.round(lead.opportunity_score * 0.5)}% pipeline boost typical for ${lead.industry.toLowerCase()} in ${lead.location}. Reply for quick demo?`,
    };
  }

  return {
    subject: `Quick idea for ${lead.business_name}`,
    body: `Hi ${businessName},\n\nI noticed ${lead.business_name} gets strong word-of-mouth in ${lead.location} but you're still handling follow ups manually. We can launch an AI concierge that answers after-hours calls, qualifies leads, and books straight into GoHighLevel in under a week.\n\nHappy to show you how your ${lead.industry.toLowerCase()} peers in ${lead.location} added ${Math.round(lead.opportunity_score * 0.5)}% more pipeline by automating.\n\n${signature}`,
  };
}

/**
 * Generate chat response with context
 */
export async function generateChatResponse(
  message: string,
  context?: Record<string, unknown>
): Promise<string> {
  const systemPrompt = loadPromptTemplate("chatSystem") || "You are Leadly.AI Copilot, a helpful assistant for managing local business leads.";

  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: context
              ? `${message}\n\nContext: ${JSON.stringify(context)}`
              : message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.warn("OpenAI chat failed", error);
    }
  }

  if (anthropicClient) {
    try {
      const result = await anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: context
              ? `${message}\n\nContext: ${JSON.stringify(context)}`
              : message,
          },
        ],
      });

      const textContent = result.content.find((block) => block.type === "text");
      if (textContent && "text" in textContent) {
        return textContent.text;
      }
    } catch (error) {
      console.warn("Anthropic chat failed", error);
    }
  }

  return "I'm here to help with lead management, outreach, and analytics. Ask me to find leads, generate outreach, or show analytics.";
}
