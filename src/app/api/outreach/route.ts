import { NextResponse } from "next/server";
import { getLeadById } from "@/lib/leads";
import { generateOutreachContent } from "@/lib/ai";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentTeamMember } from "@/lib/auth";

export async function POST(request: Request) {
  const { leadId, channel = "email" } = await request.json();

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  try {
    const lead = await getLeadById(leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const content = await generateOutreachContent(lead, channel);

    // Log the outreach
    try {
      const currentMember = await getCurrentTeamMember();
      if (currentMember) {
        await supabase.from("outreach_logs").insert({
          lead_id: leadId,
          sent_by: currentMember.id,
          channel,
          subject: content.subject || null,
          body: content.body,
        } as any); // Type assertion to handle Supabase schema issues
      }
    } catch (logError) {
      // Log outreach logging error but don't fail the request
      console.warn("Failed to log outreach:", logError);
    }

    return NextResponse.json({ leadId, channel, ...content });
  } catch (error) {
    console.error("Outreach generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate outreach",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
