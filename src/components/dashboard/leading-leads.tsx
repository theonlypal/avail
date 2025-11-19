"use client";

import type { Lead } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type Props = {
  leads: Lead[];
};

export function LeadingLeads({ leads }: Props) {
  const hottest = [...leads]
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 4);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hottest.map((lead) => (
        <Card key={lead.id} className="flex flex-col rounded-3xl border border-border/70 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{lead.business_name}</h3>
              <p className="text-xs text-muted-foreground">{lead.industry}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {lead.opportunity_score}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{lead.ai_summary}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {lead.location} • {lead.pain_points[0]}
            </span>
            <Link
              href={`/lead/${lead.id}`}
              className="inline-flex items-center text-primary hover:underline"
            >
              View
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
