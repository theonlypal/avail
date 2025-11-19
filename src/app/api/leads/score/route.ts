import { NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/leads";
import { scoreLeadWithAI } from "@/lib/ai";

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

    const scored = await scoreLeadWithAI(lead);

    // Update the lead with new scores
    await updateLead(leadId, {
      opportunity_score: scored.opportunity_score,
      pain_points: scored.pain_points,
      recommended_services: scored.recommended_services,
      ai_summary: scored.ai_summary,
      scored_at: new Date().toISOString(),
    });

    return NextResponse.json({
      leadId,
      ...scored,
    });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      {
        error: "Failed to score lead",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
