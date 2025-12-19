/**
 * AVAIL Dashboard - Modern Professional Edition
 *
 * Primary focus: Clean interface with integrated AI Copilot
 * Natural language queries to find and populate leads
 * Real-time metrics from database
 */

"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Folder,
  Settings,
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  DollarSign,
  Zap,
} from "lucide-react";
import type { LeadFilter } from "@/types";
import { fetchLeads } from "@/lib/leads-client";
import { LeadTable } from "@/components/dashboard/lead-table";
import { AISearchBar } from "@/components/dashboard/ai-search-bar";
import { FolderManager } from "@/components/dashboard/folder-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagicCard, StatCard, CompactStatCard } from "@/components/ui/magic-card";
import { ButtonShiny } from "@/components/ui/button-shiny";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DashboardMetrics {
  leads: {
    total: number;
    avgScore: number;
    highValue: number;
    thisWeek: number;
    thisMonth: number;
  };
  industries: { name: string; count: number }[];
  deals: {
    total: number;
    totalValue: number;
    won: number;
    wonValue: number;
    thisMonth: number;
  };
  stages: { name: string; count: number; value: number }[];
  contacts: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  messages: {
    total: number;
    sent: number;
    received: number;
    thisWeek: number;
  };
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    thisWeek: number;
  };
  automations: {
    active_rules: number;
    total_executions: number;
    executions_this_week: number;
  };
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<LeadFilter | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderManager, setShowFolderManager] = useState(false);

  // Lead Discovery State
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoveryIndustry, setDiscoveryIndustry] = useState("");
  const [discoveryLocation, setDiscoveryLocation] = useState("");
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  // AI Copilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMinimized, setCopilotMinimized] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI Copilot. I can help you with lead insights, sales strategies, and answer questions about your leads. Try asking me something like 'What are the top opportunities?' or 'Give me tips for calling fitness businesses.'",
      timestamp: new Date(),
    }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: leads = [], refetch } = useQuery({
    queryKey: ["leads", filter, selectedFolder],
    queryFn: () => fetchLeads(filter),
  });

  // Fetch real dashboard metrics from API
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics?team_id=default-team");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fallback stats from local leads data
  const stats = useMemo(() => {
    if (metrics) {
      return {
        total: metrics.leads.total,
        highValue: metrics.leads.highValue,
        avgScore: metrics.leads.avgScore,
        thisWeek: metrics.leads.thisWeek,
      };
    }
    return {
      total: leads.length,
      highValue: leads.filter(l => l.opportunity_score >= 80).length,
      avgScore: leads.length > 0
        ? Math.round(leads.reduce((sum, l) => sum + l.opportunity_score, 0) / leads.length)
        : 0,
      thisWeek: 0,
    };
  }, [leads, metrics]);

  const industries = useMemo(() => {
    if (metrics?.industries && metrics.industries.length > 0) {
      return metrics.industries.map(i => [i.name, i.count] as [string, number]);
    }
    return Object.entries(
      leads.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.industry] = (acc[lead.industry] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
  }, [leads, metrics]);

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Auto-scroll copilot messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  // Handle copilot message submission
  const handleCopilotMessage = async () => {
    if (!copilotInput.trim() || copilotLoading) return;

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: copilotInput.trim(),
      timestamp: new Date(),
    };

    setCopilotMessages((prev) => [...prev, userMessage]);
    setCopilotInput("");
    setCopilotLoading(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            dashboard: {
              total_leads: stats.total,
              high_value_leads: stats.highValue,
              avg_score: stats.avgScore,
              industries: industries.slice(0, 5).map(([name, count]) => ({ name, count })),
              current_filter: filter,
            },
            top_leads: leads.slice(0, 5).map((l) => ({
              business_name: l.business_name,
              industry: l.industry,
              opportunity_score: l.opportunity_score,
              location: l.location,
              pain_points: l.pain_points,
            })),
          },
        }),
      });

      const data = await response.json();
      const assistantMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm here to help! What would you like to know?",
        timestamp: new Date(),
      };

      setCopilotMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Copilot error:", error);
      const errorMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setCopilotMessages((prev) => [...prev, errorMessage]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Handle lead discovery
  const handleDiscoverLeads = async () => {
    if (!discoveryIndustry.trim() || !discoveryLocation.trim() || discoveryLoading) return;

    setDiscoveryLoading(true);
    setDiscoveryResult(null);

    try {
      const response = await fetch("/api/leads/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: discoveryIndustry.trim(),
          location: discoveryLocation.trim(),
          maxResults: 20,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDiscoveryResult(data);
        refetch(); // Refresh the leads list
      } else {
        setDiscoveryResult({ error: data.error || "Discovery failed" });
      }
    } catch (error) {
      console.error("Discovery error:", error);
      setDiscoveryResult({ error: "Failed to discover leads. Please try again." });
    } finally {
      setDiscoveryLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Subtle Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative space-y-6 pb-6">
        {/* Header - Dark premium */}
        <MagicCard className="p-6 bg-slate-900/40" gradientFrom="rgba(6, 182, 212, 0.08)" gradientTo="transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-sm -z-10" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Lead Dashboard</h1>
                <p className="text-sm text-slate-600">AI-Powered Lead Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ButtonShiny
                onClick={() => setShowDiscoveryModal(true)}
                variant="emerald"
                className="h-10 px-5"
              >
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Discover Leads
                </span>
              </ButtonShiny>
              <ButtonShiny
                onClick={() => setCopilotOpen(!copilotOpen)}
                variant="cyan"
                className="h-10 px-5"
              >
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Copilot
                </span>
              </ButtonShiny>
              <Button
                onClick={() => setShowFolderManager(!showFolderManager)}
                variant="outline"
                className="h-10 border-white/[0.08] text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/15 transition-all"
              >
                <Folder className="h-4 w-4 mr-2" />
                Folders
              </Button>
              <Button
                variant="outline"
                className="h-10 w-10 p-0 border-white/[0.08] text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/15 transition-all"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </MagicCard>

        {/* Primary Metrics Grid - Premium stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="h-4 w-4" />}
            title="Total Leads"
            value={stats.total}
            subtitle="Active in pipeline"
            trend={stats.thisWeek > 0 ? { value: `+${stats.thisWeek} this week`, positive: true } : undefined}
            accentColor="cyan"
            href="/crm/leads"
          />

          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            title="High Value"
            value={stats.highValue}
            subtitle="Score ≥ 80"
            accentColor="emerald"
            href="/crm/leads"
          />

          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            title="Pipeline Value"
            value={formatCurrency(metrics?.deals.totalValue || 0)}
            subtitle={`${metrics?.deals.total || 0} active deals`}
            accentColor="green"
            href="/crm/deals"
          />

          <StatCard
            icon={<Users className="h-4 w-4" />}
            title="Contacts"
            value={metrics?.contacts.total || 0}
            subtitle="In CRM"
            trend={metrics?.contacts.thisWeek ? { value: `+${metrics.contacts.thisWeek} this week`, positive: true } : undefined}
            accentColor="blue"
            href="/crm/contacts"
          />
        </div>

        {/* Secondary Metrics Row - Compact cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <CompactStatCard
            icon={<Mail className="h-5 w-5" />}
            title="Messages"
            value={metrics?.messages.total || 0}
            accentColor="purple"
            href="/inbox"
          />

          <CompactStatCard
            icon={<Calendar className="h-5 w-5" />}
            title="Upcoming"
            value={metrics?.appointments.upcoming || 0}
            accentColor="orange"
            href="/crm/activities"
          />

          <CompactStatCard
            icon={<Zap className="h-5 w-5" />}
            title="Automations"
            value={metrics?.automations.active_rules || 0}
            accentColor="amber"
            href="/settings/automations"
          />

          <CompactStatCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Avg Score"
            value={stats.avgScore}
            accentColor="cyan"
          />

          <CompactStatCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Won Value"
            value={formatCurrency(metrics?.deals.wonValue || 0)}
            accentColor="emerald"
          />
        </div>

        {/* AI Search Bar */}
        <AISearchBar onSearchComplete={refetch} />

        {/* Folder Manager (collapsible) */}
        {showFolderManager && (
          <FolderManager
            leads={leads}
            onFolderSelect={setSelectedFolder}
            selectedFolder={selectedFolder}
          />
        )}

        {/* Industry Quick Filters - Dark premium styling */}
        {industries.length > 0 && (
          <MagicCard className="p-4 bg-slate-900/40" gradientSize={250}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Filter:</span>
              <Button
                onClick={() => setFilter(undefined)}
                variant="outline"
                size="sm"
                className={`h-8 text-xs transition-all ${
                  !filter?.industry
                    ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                    : "border-white/[0.05] bg-slate-950/60 text-slate-500 hover:bg-slate-900/60 hover:text-white hover:border-white/10"
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
                  className={`h-8 text-xs transition-all ${
                    filter?.industry === industry
                      ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                      : "border-white/[0.05] bg-slate-950/60 text-slate-500 hover:bg-slate-900/60 hover:text-white hover:border-white/10"
                  }`}
                >
                  {industry} ({count})
                </Button>
              ))}
            </div>
          </MagicCard>
        )}

        {/* Main Leads Table - Dark premium card wrapper */}
        <MagicCard className="overflow-hidden bg-slate-900/40" gradientSize={350}>
          <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedFolder ? `Folder: ${selectedFolder}` : "Lead Pipeline"}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {leads.length} active leads
              </p>
            </div>

            {filter && (
              <Button
                onClick={() => setFilter(undefined)}
                variant="outline"
                size="sm"
                className="h-8 border-white/[0.05] bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900/60"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {leads.length > 0 ? (
            <LeadTable leads={leads} />
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 mb-4">
                <Search className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No leads yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
                Use the AI search bar above to find businesses. Try: "Find me 20 HVAC companies in San Diego with less than 4.5 star ratings"
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="border-white/[0.08] text-slate-500 text-xs">
                  "dental practices in Austin"
                </Badge>
                <Badge variant="outline" className="border-white/[0.08] text-slate-500 text-xs">
                  "restaurants in Chicago with poor reviews"
                </Badge>
                <Badge variant="outline" className="border-white/[0.08] text-slate-500 text-xs">
                  "plumbers in Phoenix without websites"
                </Badge>
              </div>
            </div>
          )}
        </MagicCard>

        {/* Industry Breakdown - Dark premium grid */}
        {industries.length > 0 && (
          <MagicCard className="p-6 bg-slate-900/40" gradientSize={300}>
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Industry Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {industries.map(([industry, count]) => (
                <button
                  key={industry}
                  onClick={() => setFilter({ ...filter, industry })}
                  className="rounded-xl border border-white/[0.03] bg-slate-950/60 p-4 hover:bg-slate-900/60 hover:border-cyan-500/20 transition-all text-left group"
                >
                  <div className="text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-colors">{industry}</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-2">{count}</div>
                  <div className="text-[10px] text-slate-700 mt-1 uppercase tracking-wider">leads</div>
                </button>
              ))}
            </div>
          </MagicCard>
        )}

        {/* Lead Discovery Modal */}
        {showDiscoveryModal && (
          <div className="fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowDiscoveryModal(false); setDiscoveryResult(null); }} />
            {/* Scrollable container */}
            <div className="relative flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch p-4 pt-8 md:pt-4 md:flex md:items-center md:justify-center">
              <div className="relative bg-slate-950 border border-white/[0.04] rounded-2xl w-full max-w-2xl mx-auto mb-8 md:mb-0 shadow-2xl shadow-black/50">
              <div className="border-b border-white/[0.04] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-600/15 border border-emerald-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Discover New Leads</h2>
                      <p className="text-sm text-slate-500">AI-powered lead discovery with automatic enrichment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDiscoveryModal(false);
                      setDiscoveryResult(null);
                    }}
                    className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {!discoveryResult ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={discoveryIndustry}
                          onChange={(e) => setDiscoveryIndustry(e.target.value)}
                          placeholder="e.g., restaurants, fitness, retail"
                          className="w-full bg-slate-900/60 border border-white/[0.04] rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                          disabled={discoveryLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={discoveryLocation}
                          onChange={(e) => setDiscoveryLocation(e.target.value)}
                          placeholder="e.g., San Diego, CA"
                          className="w-full bg-slate-900/60 border border-white/[0.04] rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                          disabled={discoveryLoading}
                        />
                      </div>

                      <div className="bg-slate-900/40 border border-white/[0.03] rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="text-sm text-slate-400">
                            <p className="font-medium text-slate-300 mb-1">AI-Powered Discovery</p>
                            <p className="text-slate-500 leading-relaxed">
                              Our AI will search Google Maps, analyze businesses, and automatically enrich leads
                              with website scores, social presence, and opportunity ratings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ButtonShiny
                        onClick={handleDiscoverLeads}
                        disabled={discoveryLoading || !discoveryIndustry.trim() || !discoveryLocation.trim()}
                        variant="emerald"
                        className="flex-1 h-12"
                      >
                        {discoveryLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Discovering Leads...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Discover Leads
                          </span>
                        )}
                      </ButtonShiny>
                      <Button
                        onClick={() => setShowDiscoveryModal(false)}
                        variant="outline"
                        disabled={discoveryLoading}
                        className="border-white/[0.04] bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 hover:text-white hover:border-white/[0.08]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {discoveryResult.error ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-red-400 text-sm">{discoveryResult.error}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Discovery Complete!</h3>
                              <p className="text-sm text-slate-400">{discoveryResult.message}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-950/60 border border-white/[0.03] rounded-xl p-4">
                              <div className="text-2xl font-bold text-white">{discoveryResult.discovered}</div>
                              <div className="text-xs text-slate-500">Discovered</div>
                            </div>
                            <div className="bg-slate-950/60 border border-white/[0.03] rounded-xl p-4">
                              <div className="text-2xl font-bold text-emerald-400">{discoveryResult.created}</div>
                              <div className="text-xs text-slate-500">Created</div>
                            </div>
                            <div className="bg-slate-950/60 border border-white/[0.03] rounded-xl p-4">
                              <div className="text-2xl font-bold text-cyan-400">{discoveryResult.enriched}</div>
                              <div className="text-xs text-slate-500">Enriched</div>
                            </div>
                          </div>
                        </div>

                        <ButtonShiny
                          onClick={() => {
                            setShowDiscoveryModal(false);
                            setDiscoveryResult(null);
                            setDiscoveryIndustry("");
                            setDiscoveryLocation("");
                          }}
                          variant="emerald"
                          className="w-full h-12"
                        >
                          Done
                        </ButtonShiny>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* AI Copilot Floating Widget */}
        {copilotOpen && (
          <div
            className={`fixed z-50 bg-slate-950 border border-white/[0.04] shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300 flex flex-col ${
              copilotMinimized
                ? "bottom-6 right-6 w-80 h-16 rounded-2xl"
                : "inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] rounded-2xl"
            }`}
          >
        {/* Copilot Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/[0.04] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Copilot</div>
              <div className="text-xs text-slate-500">Always here to help</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCopilotMinimized(!copilotMinimized)}
              className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              {copilotMinimized ? (
                <Maximize2 className="h-4 w-4 text-slate-500" />
              ) : (
                <Minimize2 className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <button
              onClick={() => setCopilotOpen(false)}
              className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Copilot Messages (only visible when not minimized) */}
        {!copilotMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-128px)]">
              {copilotMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      msg.role === "user"
                        ? "bg-cyan-500/15 border border-cyan-500/20 text-white"
                        : "bg-slate-900/60 border border-white/[0.04] text-slate-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/60 border border-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Copilot Input */}
            <div className="flex-shrink-0 border-t border-white/[0.04] p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCopilotMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-900/60 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  disabled={copilotLoading}
                />
                <button
                  onClick={handleCopilotMessage}
                  disabled={copilotLoading || !copilotInput.trim()}
                  className="p-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            </>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
