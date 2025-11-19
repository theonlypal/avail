"use client";

import { Activity, BarChart3, Flame, Users } from "lucide-react";
import type { Lead } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const icons = {
  pipeline: Flame,
  speed: Activity,
  coverage: BarChart3,
  team: Users,
};

type Props = {
  leads: Lead[];
};

export function SummaryCards({ leads }: Props) {
  const avgScore =
    leads.length > 0 ? leads.reduce((acc, lead) => acc + lead.opportunity_score, 0) / leads.length : 0;
  const hotLeads = leads.filter((lead) => lead.opportunity_score >= 90).length;
  const industries = new Set(leads.map((lead) => lead.industry)).size;
  const followUps = Math.round(leads.length * 0.42);

  const data = [
    {
      label: "AI Qualified",
      value: hotLeads,
      subLabel: "Score ≥ 90",
      icon: icons.pipeline,
    },
    {
      label: "Avg Score",
      value: avgScore.toFixed(1),
      subLabel: `Across ${leads.length} leads`,
      icon: icons.speed,
    },
    {
      label: "Industries",
      value: industries,
      subLabel: "Segment coverage",
      icon: icons.coverage,
    },
    {
      label: "Active Plays",
      value: followUps,
      subLabel: "Need outreach",
      icon: icons.team,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((item, index) => (
        <Card key={item.label} className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-cyan-500/30 transition-all stagger-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{item.value}</div>
            <p className="text-xs text-slate-400">{item.subLabel}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
