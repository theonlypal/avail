// @ts-nocheck
import { fetchLeads, getLeadById, searchAndImportLeads } from "./leads";
import { getTeamMembers } from "./team";
import { generateOutreachContent } from "./ai";
import { updateAssignment } from "./assignments";
import { parseNaturalLanguageIntent } from "./nlp";
import type { Lead } from "@/types";

// Fallback regex patterns (used if AI NLP fails)
const actionRegex = {
  findLeads: /(find|show|search|get|discover)\s+(?<count>\d+)?\s*(?:leads?|businesses?|companies?)(?:\s+in\s+(?<city>[a-zA-Z\s,]+))?(?:\s+(?:for|in|about)\s+(?<industry>[a-zA-Z\s]+))?/i,
  outreach: /(send|generate|create|draft|write).*(email|sms|message).*?(?:for\s+)?(?<id>[\w-]+)/i,
  analytics: /(show|open|display|view).*(analytics|heatmap|map|stats|statistics|performance)/i,
  assign: /(assign|route|give|allocate)\s+(?<id>[\w-]+).*?(?:to\s+)?(?<member>[a-zA-Z]+)/i,
  score: /(score|evaluate|assess|rate|analyze)\s+(?:lead\s+)?(?<id>[\w-]+)/i,
  enrich: /(enrich|enhance|augment|get\s+data\s+for)\s+(?:lead\s+)?(?<id>[\w-]+)/i,
};

type ChatAction =
  | {
      name: "find_leads";
      payload: { leads: Lead[]; industry?: string; city?: string };
    }
  | {
      name: "generate_outreach";
      payload: { leadId: string; content: Awaited<ReturnType<typeof generateOutreachContent>> };
    }
  | { name: "show_analytics"; payload: { summary: string } }
  | { name: "assign_lead"; payload: { leadId: string; userId: string } }
  | { name: "score_lead"; payload: { leadId: string; score: unknown } }
  | { name: "enrich_lead"; payload: { leadId: string; enrichment: unknown } };

export type ChatOrchestratorResult = {
  text: string;
  action?: ChatAction;
};

/**
 * Handle chat messages with AI-powered NLP (GPT-4 function calling)
 * Falls back to regex if AI unavailable
 */
export async function handleChatMessage(message: string): Promise<ChatOrchestratorResult> {
  // Try AI-powered NLP first (alien-level intelligence)
  const intent = await parseNaturalLanguageIntent(message);

  if (intent) {
    // AI successfully parsed the intent - route to handlers
    switch (intent.function) {
      case "find_leads":
        return await handleFindLeads(
          intent.arguments.location,
          intent.arguments.industry,
          intent.arguments.count
        );

      case "generate_outreach":
        return await handleGenerateOutreach(
          intent.arguments.leadId,
          intent.arguments.channel
        );

      case "show_analytics":
        return await handleShowAnalytics(intent.arguments.type);

      case "assign_lead":
        return await handleAssignLead(
          intent.arguments.leadId,
          intent.arguments.memberName
        );

      case "score_lead":
        return await handleScoreLead(intent.arguments.leadId);

      case "enrich_lead":
        return await handleEnrichLead(intent.arguments.leadId);
    }
  }

  // Fallback to regex patterns (legacy support)
  // Find leads
  const findMatch = actionRegex.findLeads.exec(message);
  if (findMatch) {
    const industry = findMatch.groups?.industry?.trim();
    const city = findMatch.groups?.city?.trim() || "San Diego";
    const count = parseInt(findMatch.groups?.count ?? "10", 10);

    return await handleFindLeads(city, industry, count);
  }

  // Generate outreach
  const outreachMatch = actionRegex.outreach.exec(message);
  if (outreachMatch) {
    const leadId = outreachMatch.groups?.id;
    if (!leadId) {
      return { text: "Please include a lead ID." };
    }

    const channel = message.includes("sms") ? "sms" : "email";
    return await handleGenerateOutreach(leadId, channel);
  }

  // Show analytics
  const analyticsMatch = actionRegex.analytics.exec(message);
  if (analyticsMatch) {
    return await handleShowAnalytics();
  }

  // Assign lead
  const assignMatch = actionRegex.assign.exec(message);
  if (assignMatch) {
    const leadId = assignMatch.groups?.id;
    const memberName = assignMatch.groups?.member;

    if (!leadId || !memberName) {
      return { text: "Please provide a lead ID and rep name." };
    }

    return await handleAssignLead(leadId, memberName);
  }

  // Score lead
  const scoreMatch = actionRegex.score.exec(message);
  if (scoreMatch) {
    const leadId = scoreMatch.groups?.id;
    if (!leadId) {
      return { text: "Please include a lead ID." };
    }

    return await handleScoreLead(leadId);
  }

  // Enrich lead
  const enrichMatch = actionRegex.enrich.exec(message);
  if (enrichMatch) {
    const leadId = enrichMatch.groups?.id;
    if (!leadId) {
      return { text: "Please include a lead ID." };
    }

    return await handleEnrichLead(leadId);
  }

  // For general questions about AVAIL, use AI to answer
  return await handleGeneralQuestion(message);
}

/**
 * Handler: Find leads
 */
async function handleFindLeads(
  location: string,
  industry?: string,
  count: number = 10
): Promise<ChatOrchestratorResult> {
  try {
    // First check database
    const filter: {
      search?: string;
      industries?: string[];
    } = {};

    if (industry) {
      filter.industries = [industry];
    }

    if (location) {
      filter.search = location;
    }

    let leads = await fetchLeads(filter);

    // If no leads in database, search external APIs
    if (leads.length === 0 && location) {
      const importedLeads = await searchAndImportLeads(
        industry || "",
        location,
        Math.min(count, 50)
      );
      leads = importedLeads;
    }

    const filtered = leads.slice(0, count);

    return {
      text: `Found ${filtered.length} ${industry ? industry : "business"} leads in ${location}. ${
        leads.length > count ? `Showing top ${count}.` : ""
      }`,
      action: {
        name: "find_leads",
        payload: { leads: filtered, industry, city: location },
      },
    };
  } catch (error) {
    console.error("Error fetching leads:", error);
    return {
      text: "Sorry, I couldn't fetch leads at the moment. Please check your API keys and try again.",
    };
  }
}

/**
 * Handler: Generate outreach
 */
async function handleGenerateOutreach(
  leadId: string,
  channel: "email" | "sms"
): Promise<ChatOrchestratorResult> {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) {
      return { text: `I could not find lead ${leadId}.` };
    }

    const content = await generateOutreachContent(lead, channel);

    return {
      text: `Drafted ${channel === "sms" ? "SMS" : "email"} outreach for ${lead.business_name}.`,
      action: {
        name: "generate_outreach",
        payload: { leadId, content },
      },
    };
  } catch (error) {
    console.error("Error generating outreach:", error);
    return {
      text: "Sorry, I couldn't generate outreach. Please check your AI API keys.",
    };
  }
}

/**
 * Handler: Show analytics
 */
async function handleShowAnalytics(
  type?: "summary" | "heatmap" | "performance" | "industry"
): Promise<ChatOrchestratorResult> {
  try {
    const leads = await fetchLeads();

    if (leads.length === 0) {
      return {
        text: "No leads in database yet. Try searching for leads first!",
      };
    }

    const avgScore =
      leads.reduce((acc, lead) => acc + lead.opportunity_score, 0) / leads.length || 0;

    const industryCount = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.industry] = (acc[lead.industry] ?? 0) + 1;
      return acc;
    }, {});

    const winner = Object.entries(industryCount).sort((a, b) => b[1] - a[1])[0];
    const summary = `${leads.length} total leads, avg opportunity score ${avgScore.toFixed(
      1
    )}. Top industry: ${winner?.[0]} (${winner?.[1]} leads).`;

    return {
      text: summary,
      action: { name: "show_analytics", payload: { summary } },
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      text: "Sorry, I couldn't fetch analytics. Please try again.",
    };
  }
}

/**
 * Handler: Assign lead
 */
async function handleAssignLead(
  leadId: string,
  memberName: string
): Promise<ChatOrchestratorResult> {
  try {
    const members = await getTeamMembers();
    const member = members.find(
      (m) => m.name.toLowerCase() === memberName.toLowerCase()
    );

    if (!member) {
      return { text: `I could not find ${memberName} on your team.` };
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return { text: `Lead ${leadId} is not in your workspace.` };
    }

    await updateAssignment(leadId, member.id);

    return {
      text: `✅ Assigned ${lead.business_name} to ${member.name}.`,
      action: { name: "assign_lead", payload: { leadId, userId: member.id } },
    };
  } catch (error) {
    console.error("Error assigning lead:", error);
    return {
      text: "Sorry, I couldn't assign the lead. Please try again.",
    };
  }
}

/**
 * Handler: Score lead with AI
 */
async function handleScoreLead(leadId: string): Promise<ChatOrchestratorResult> {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) {
      return { text: `Lead ${leadId} not found.` };
    }

    // Call scoring API
    const response = await fetch("/api/leads/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });

    const score = await response.json();

    return {
      text: `✅ Scored ${lead.business_name}: ${score.opportunity_score}/100. Pain points: ${score.pain_points.join(", ")}`,
      action: { name: "score_lead", payload: { leadId, score } },
    };
  } catch (error) {
    console.error("Error scoring lead:", error);
    return {
      text: "Sorry, I couldn't score the lead. Check your AI API keys.",
    };
  }
}

/**
 * Handler: Enrich lead with external data
 */
async function handleEnrichLead(leadId: string): Promise<ChatOrchestratorResult> {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) {
      return { text: `Lead ${leadId} not found.` };
    }

    // Call enrichment API
    const response = await fetch("/api/leads/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });

    const enrichment = await response.json();

    return {
      text: `✅ Enriched ${lead.business_name} with ${enrichment.source === "live" ? "live" : "heuristic"} data.`,
      action: { name: "enrich_lead", payload: { leadId, enrichment } },
    };
  } catch (error) {
    console.error("Error enriching lead:", error);
    return {
      text: "Sorry, I couldn't enrich the lead. Check your enrichment API keys.",
    };
  }
}

/**
 * Handler: Answer general questions about AVAIL using AI
 */
async function handleGeneralQuestion(message: string): Promise<ChatOrchestratorResult> {
  try {
    const { generateChatResponse } = await import("./ai");

    const systemContext = {
      companyName: "AVAIL",
      companyMeaning: "Avail means 'to help or benefit' - our mission is to help businesses benefit from AI automation",
      services: [
        "AI Lead Generation (leadly.ai - our proprietary lead engine)",
        "24/7 AI Customer Support",
        "AI Sales Automation",
        "AI Appointment Scheduling",
        "AI Review Management",
        "SMS & Email Automation"
      ],
      pricing: "$9,999/mo (customizable enterprise pricing)",
      phone: "(626) 394-7645",
      features: [
        "24/7 AI availability",
        "Unlimited lead capture",
        "CRM integration (GoHighLevel)",
        "Multi-channel automation",
        "Custom AI training",
        "Dedicated account manager"
      ],
      benefits: [
        "Capture leads 24/7 even after hours",
        "Respond to customers instantly",
        "Automate repetitive tasks",
        "Increase booking rates by 65%+",
        "Improve online ratings",
        "Save 20+ hours per week"
      ]
    };

    const enhancedMessage = `You are AVAIL Copilot, an AI assistant representing AVAIL - an enterprise AI automation platform. Answer this question professionally and helpfully: "${message}"\n\nContext about AVAIL: ${JSON.stringify(systemContext)}`;

    const response = await generateChatResponse(enhancedMessage);

    return {
      text: response
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      text: "I'm AVAIL Copilot! I can answer questions about AVAIL's AI automation services, pricing, features, and how we help businesses grow. I can also help you manage leads - try asking to 'find leads' or 'show analytics'."
    };
  }
}
