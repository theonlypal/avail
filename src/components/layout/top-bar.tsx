"use client";

import { useEffect, useState } from "react";
import { Bell, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentTeam } from "@/lib/team";
import { fetchLeads } from "@/lib/leads";
import type { Team, Lead } from "@/types";

export function TopBar() {
  const [team, setTeam] = useState<Team | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    Promise.all([getCurrentTeam(), fetchLeads()])
      .then(([teamData, leadsData]) => {
        setTeam(teamData);
        setLeads(leadsData);
      })
      .catch(console.error);
  }, []);

  const avgScore =
    leads.length > 0 ? leads.reduce((acc, lead) => acc + lead.opportunity_score, 0) / leads.length : 0;

  const handleExport = () => {
    const rows = [
      ["Business", "Industry", "Score", "Location", "Assigned"],
      ...leads.map((lead) => [
        lead.business_name,
        lead.industry,
        String(lead.opportunity_score),
        lead.location,
        lead.owner ?? "Unassigned",
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "avail-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/30 backdrop-blur-xl px-6 py-4">
      <div>
        <p className="text-sm text-slate-400">Pipeline Health</p>
        <h2 className="text-xl font-semibold text-white">{leads.length} Local leads • Avg score {avgScore.toFixed(1)}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-400/50"
          aria-label="Export CSV"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-slate-400 hover:text-white hover:bg-white/5">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <div className="rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400">
          {team?.subscription_tier.toUpperCase() || 'FREE'} PLAN
        </div>
      </div>
    </header>
  );
}
