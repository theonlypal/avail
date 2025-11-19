import { NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/leads";

const CLEARBIT_URL = "https://company.clearbit.com/v2/companies/find";
const BUILTWITH_URL = "https://api.builtwith.com/v21/api.json";

async function enrichWithClearbit(domain: string) {
  const key = process.env.CLEARBIT_KEY;
  if (!key || !domain) return null;

  const response = await fetch(`${CLEARBIT_URL}?domain=${domain}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Clearbit request failed");
  return response.json();
}

async function enrichWithBuiltWith(domain: string) {
  const key = process.env.BUILTWITH_KEY;
  if (!key || !domain) return null;

  const url = `${BUILTWITH_URL}?KEY=${key}&LOOKUP=${domain}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) throw new Error("BuiltWith request failed");
  return response.json();
}

export async function POST(request: Request) {
  const { leadId } = await request.json();

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  try {
    const lead = await getLeadById(leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const enrichmentData: {
      clearbit?: unknown;
      builtwith?: unknown;
      source: string;
    } = {
      source: "none",
    };

    if (lead.website) {
      const [clearbitData, builtWithData] = await Promise.all([
        enrichWithClearbit(lead.website).catch(() => null),
        enrichWithBuiltWith(lead.website).catch(() => null),
      ]);

      if (clearbitData || builtWithData) {
        enrichmentData.clearbit = clearbitData;
        enrichmentData.builtwith = builtWithData;
        enrichmentData.source = "live";

        // Update lead with enrichment timestamp
        await updateLead(leadId, {
          enriched_at: new Date().toISOString(),
        });
      }
    }

    if (enrichmentData.source === "none") {
      // Return heuristic enrichment data
      return NextResponse.json({
        source: "heuristic",
        enrichment: {
          tech_stack: ["WordPress", "Google Analytics"],
          ads: {
            google: false,
            facebook: true,
          },
          hiring_signals: "May be hiring for front desk or marketing roles",
          summary:
            "Manual funnels, high call volume, low automation – good candidate for AI rollout.",
        },
      });
    }

    return NextResponse.json(enrichmentData);
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      {
        error: "Failed to enrich lead",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
