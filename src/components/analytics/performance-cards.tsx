"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeamPerformance } from "@/lib/team";

type RepStats = {
  name: string;
  total: number;
  avgScore: number;
  automation: number;
};

export function PerformanceCards() {
  const [reps, setReps] = useState<RepStats[]>([]);

  useEffect(() => {
    getTeamPerformance()
      .then((stats) => {
        const repStats = stats.map((stat) => ({
          name: stat.member.name,
          total: stat.assignedLeads,
          avgScore: 0, // Will need to calculate from leads
          automation: Math.round((stat.outreachSent / Math.max(stat.assignedLeads, 1)) * 100),
        }));
        setReps(repStats);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reps.map((rep, index) => (
        <Card key={rep.name} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-cyan-500/30 transition-all stagger-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader>
            <CardTitle className="text-base text-white">{rep.name}</CardTitle>
            <p className="text-xs text-slate-400">{rep.total} leads</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Avg Score</p>
              <Progress value={rep.avgScore} className="bg-white/10" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Automation Coverage</p>
              <Progress value={rep.automation} className="bg-white/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
