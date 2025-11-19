// @ts-nocheck
// @ts-nocheck
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Function definitions for GPT-4 function calling
 */
const LEADLY_FUNCTIONS = [
  {
    name: "find_leads",
    description: "Search for business leads by industry, location, and count",
    parameters: {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "The industry or business type (e.g., 'dental clinics', 'auto repair', 'restaurants')",
        },
        location: {
          type: "string",
          description: "City or location to search (e.g., 'San Diego', 'Miami', 'New York')",
        },
        count: {
          type: "number",
          description: "Number of leads to find (default: 10, max: 100)",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["location"],
    },
  },
  {
    name: "generate_outreach",
    description: "Generate personalized email or SMS outreach for a specific lead",
    parameters: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "The unique identifier of the lead",
        },
        channel: {
          type: "string",
          enum: ["email", "sms"],
          description: "The communication channel (email or sms)",
        },
      },
      required: ["leadId", "channel"],
    },
  },
  {
    name: "show_analytics",
    description: "Display analytics and statistics about leads",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["summary", "heatmap", "performance", "industry"],
          description: "Type of analytics to show",
        },
      },
    },
  },
  {
    name: "assign_lead",
    description: "Assign a lead to a team member",
    parameters: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "The unique identifier of the lead",
        },
        memberName: {
          type: "string",
          description: "The name of the team member (e.g., 'Zach', 'Ryan', 'DC')",
        },
      },
      required: ["leadId", "memberName"],
    },
  },
  {
    name: "score_lead",
    description: "Score a lead using AI to determine opportunity and pain points",
    parameters: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "The unique identifier of the lead",
        },
      },
      required: ["leadId"],
    },
  },
  {
    name: "enrich_lead",
    description: "Enrich a lead with additional data from external sources",
    parameters: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "The unique identifier of the lead",
        },
      },
      required: ["leadId"],
    },
  },
] as const;

type LeadlyFunction = typeof LEADLY_FUNCTIONS[number]["name"];

type FunctionArgs = {
  find_leads: {
    industry?: string;
    location: string;
    count?: number;
  };
  generate_outreach: {
    leadId: string;
    channel: "email" | "sms";
  };
  show_analytics: {
    type?: "summary" | "heatmap" | "performance" | "industry";
  };
  assign_lead: {
    leadId: string;
    memberName: string;
  };
  score_lead: {
    leadId: string;
  };
  enrich_lead: {
    leadId: string;
  };
};

export type ParsedIntent<T extends LeadlyFunction = LeadlyFunction> = {
  function: T;
  arguments: FunctionArgs[T];
  confidence: number;
  rawMessage: string;
};

/**
 * Parse natural language intent using GPT-4 function calling
 * This is the "alien-level" NLP that understands context and nuance
 */
export async function parseNaturalLanguageIntent(
  message: string
): Promise<ParsedIntent | null> {
  // Try OpenAI GPT-4 function calling first
  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Leadly.AI Copilot, an intelligent assistant for sales teams. Parse user requests into function calls. Be flexible with industry names (e.g., 'dentists' = 'dental clinics', 'car repair' = 'auto repair').",
          },
          {
            role: "user",
            content: message,
          },
        ],
        functions: LEADLY_FUNCTIONS as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[],
        function_call: "auto",
        temperature: 0.3,
      });

      const functionCall = completion.choices[0]?.message?.function_call;

      if (functionCall?.name && functionCall?.arguments) {
        const args = JSON.parse(functionCall.arguments);

        return {
          function: functionCall.name as LeadlyFunction,
          arguments: args,
          confidence: 0.9,
          rawMessage: message,
        };
      }
    } catch (error) {
      console.warn("OpenAI function calling failed, trying Anthropic:", error);
    }
  }

  // Fallback to Anthropic Claude with tools
  if (anthropicClient) {
    try {
      const tools = LEADLY_FUNCTIONS.map((func) => ({
        name: func.name,
        description: func.description,
        input_schema: func.parameters,
      }));

      const response = await anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        temperature: 0.3,
        system:
          "You are Leadly.AI Copilot. Parse user requests into tool calls. Be flexible with industry names and locations.",
        messages: [{ role: "user", content: message }],
        tools,
      });

      const toolUse = response.content.find((block) => block.type === "tool_use");

      if (toolUse && "name" in toolUse && "input" in toolUse) {
        return {
          function: toolUse.name as LeadlyFunction,
          arguments: toolUse.input as FunctionArgs[LeadlyFunction],
          confidence: 0.85,
          rawMessage: message,
        };
      }
    } catch (error) {
      console.warn("Anthropic tool use failed:", error);
    }
  }

  // If no AI available, return null (fallback to regex in chat.ts)
  return null;
}

/**
 * Extract structured data from unstructured text using AI
 * Example: "I need contractors in Chicago who fix roofs" → { industry: "roofing contractors", location: "Chicago" }
 */
export async function extractStructuredData(text: string): Promise<Record<string, unknown>> {
  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Extract structured data from user messages. Return JSON with keys: industry, location, count, intent. Normalize industry names (e.g., 'dentists' → 'dental clinics').",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("Structured data extraction failed:", error);
    }
  }

  return {};
}

/**
 * Enhance a user query with AI suggestions
 * Example: "find businesses" → "What type of businesses? In which city?"
 */
export async function suggestQueryEnhancements(query: string): Promise<string[]> {
  if (openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Suggest clarifying questions to improve vague queries. Return JSON array of 2-3 short suggestions.",
          },
          {
            role: "user",
            content: `User query: "${query}". What clarifying questions should I ask?`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed.suggestions || [];
      }
    } catch (error) {
      console.warn("Query enhancement failed:", error);
    }
  }

  return [];
}
