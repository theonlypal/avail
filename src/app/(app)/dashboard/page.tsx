/**
 * Leadly.AI Dashboard - Redesigned
 *
 * Primary focus: Leads table with AI-powered search
 * Natural language queries to find and populate leads
 */

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Folder, Plus, Settings } from "lucide-react";
import type { LeadFilter } from "@/types";
import { fetchLeads } from "@/lib/leads-client";
import { LeadTable } from "@/components/dashboard/lead-table";
import { AISearchBar } from "@/components/dashboard/ai-search-bar";
import { FolderManager } from "@/components/dashboard/folder-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [filter, setFilter] = useState<LeadFilter | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderManager, setShowFolderManager] = useState(false);

  const { data: leads = [], refetch } = useQuery({
    queryKey: ["leads", filter, selectedFolder],
    queryFn: () => fetchLeads(filter),
  });

  const stats = useMemo(() => {
    return {
      total: leads.length,
      highValue: leads.filter(l => l.opportunity_score >= 80).length,
      contacted: 0, // TODO: Track contacted status
      avgScore: leads.length > 0
        ? Math.round(leads.reduce((sum, l) => sum + l.opportunity_score, 0) / leads.length)
        : 0,
    };
  }, [leads]);

  const industries = useMemo(
    () =>
      Object.entries(
        leads.reduce<Record<string, number>>((acc, lead) => {
          acc[lead.industry] = (acc[lead.industry] ?? 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]),
    [leads]
  );

  return (
    <div className="space-y-6">
      {/* Header with AI Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-cyan-400" />
              Leadly.AI
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered lead intelligence platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowFolderManager(!showFolderManager)}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Folder className="h-4 w-4 mr-2" />
              Folders
            </Button>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm text-slate-400">Total Leads</div>
            <div className="text-3xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm text-slate-400">High Value</div>
            <div className="text-3xl font-bold text-green-400 mt-1">{stats.highValue}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm text-slate-400">Avg Score</div>
            <div className="text-3xl font-bold text-cyan-400 mt-1">{stats.avgScore}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-sm text-slate-400">Industries</div>
            <div className="text-3xl font-bold text-purple-400 mt-1">{industries.length}</div>
          </div>
        </div>

        {/* AI Search Bar - Primary Feature */}
        <AISearchBar onSearchComplete={refetch} />
      </div>

      {/* Folder Manager (collapsible) */}
      {showFolderManager && (
        <FolderManager
          leads={leads}
          onFolderSelect={setSelectedFolder}
          selectedFolder={selectedFolder}
        />
      )}

      {/* Industry Quick Filters */}
      {industries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-400">Quick Filter:</span>
          <Button
            onClick={() => setFilter(undefined)}
            variant="outline"
            size="sm"
            className={`border-white/10 text-white hover:bg-white/5 ${
              !filter?.industry ? "bg-cyan-500/20 border-cyan-500/50" : ""
            }`}
          >
            All ({stats.total})
          </Button>
          {industries.slice(0, 6).map(([industry, count]) => (
            <Button
              key={industry}
              onClick={() => setFilter({ ...filter, industry })}
              variant="outline"
              size="sm"
              className={`border-white/10 text-white hover:bg-white/5 ${
                filter?.industry === industry ? "bg-cyan-500/20 border-cyan-500/50" : ""
              }`}
            >
              {industry} ({count})
            </Button>
          ))}
        </div>
      )}

      {/* Main Leads Table */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {selectedFolder ? `Folder: ${selectedFolder}` : "All Leads"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {leads.length} leads • Click any lead to view details or start calling
            </p>
          </div>

          {filter && (
            <Button
              onClick={() => setFilter(undefined)}
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {leads.length > 0 ? (
          <LeadTable leads={leads} />
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
              <Search className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No leads yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Use the AI search bar above to find businesses. Try: "Find me 20 HVAC companies in San Diego with less than 4.5 star ratings"
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="border-white/20 text-slate-400">
                💡 "dental practices in Austin"
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-400">
                💡 "restaurants in Chicago with poor reviews"
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-400">
                💡 "plumbers in Phoenix without websites"
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Industry Breakdown (bottom section) */}
      {industries.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Industry Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {industries.map(([industry, count]) => (
              <button
                key={industry}
                onClick={() => setFilter({ ...filter, industry })}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left"
              >
                <div className="text-sm font-semibold text-white">{industry}</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{count}</div>
                <div className="text-xs text-slate-400 mt-1">leads</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
