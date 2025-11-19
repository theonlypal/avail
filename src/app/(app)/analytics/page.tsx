"use client";

import { useState } from "react";
import { LeadMap } from "@/components/analytics/lead-map";
import { PerformanceCards } from "@/components/analytics/performance-cards";
import { LeadFilters } from "@/components/dashboard/lead-filters";
import { fetchLeads } from "@/lib/leads";
import type { LeadFilter } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<LeadFilter>();
  const { data: leads = [] } = useQuery({
    queryKey: ["analytics", filter],
    queryFn: () => fetchLeads(filter),
  });

  const totals = leads.reduce(
    (acc, lead) => {
      acc.score += lead.opportunity_score;
      acc.withAds += lead.ad_presence ? 1 : 0;
      return acc;
    },
    { score: 0, withAds: 0 }
  );
  const avgScore = leads.length ? Math.round(totals.score / leads.length) : 0;
  const industryBreakdown = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.industry] = (acc[lead.industry] ?? 0) + 1;
    return acc;
  }, {});
  const topIndustries = Object.entries(industryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">AI-powered insights and performance metrics</p>
      </div>

      <LeadFilters onChange={setFilter} />
      <LeadMap leads={leads} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-cyan-500/30 transition-all">
          <p className="text-sm text-slate-400">Qualified Leads</p>
          <div className="text-3xl font-semibold text-white">{leads.length}</div>
          <p className="text-xs text-slate-400">Filtered result</p>
        </Card>
        <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-cyan-500/30 transition-all">
          <p className="text-sm text-slate-400">Avg Score</p>
          <div className="text-3xl font-semibold text-white">{avgScore}</div>
          <p className="text-xs text-slate-400">AI propensity</p>
        </Card>
        <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-cyan-500/30 transition-all">
          <p className="text-sm text-slate-400">Paid Ads Present</p>
          <div className="text-3xl font-semibold text-white">{totals.withAds}</div>
          <p className="text-xs text-slate-400">Opportunity for AI retargeting</p>
        </Card>
      </div>

      <PerformanceCards />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-lg font-semibold text-white">Top Industries</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
            {topIndustries.map(([industry, count]) => (
              <div key={industry} className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
                <p className="text-white">{industry}</p>
                <p>{count} leads</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-lg font-semibold text-white">Automation Board</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            {[
              "Lead intake → AI scoring",
              "Rep assignment → GoHighLevel push",
              "Outreach → SMS + email cadences",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
                <p className="text-white">
                  {index + 1}. {item}
                </p>
                <p>SLAs met: 94%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
