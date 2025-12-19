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
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { LeadFilter } from "@/types";
import { fetchLeads } from "@/lib/leads-client";
import { LeadTable } from "@/components/dashboard/lead-table";
import { AISearchBar } from "@/components/dashboard/ai-search-bar";
import { FolderManager } from "@/components/dashboard/folder-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    <div className="relative min-h-screen">
      {/* Main Content */}
      <div className="space-y-5 pb-6">
        {/* Refined Header */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AVAIL
                </h1>
                <p className="text-sm text-slate-400">
                  AI-Powered Lead Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowDiscoveryModal(true)}
                className="h-10 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Target className="h-4 w-4 mr-2" />
                Discover Leads
              </Button>
              <Button
                onClick={() => setCopilotOpen(!copilotOpen)}
                className="h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Copilot
              </Button>
              <Button
                onClick={() => setShowFolderManager(!showFolderManager)}
                variant="outline"
                className="h-10 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Folder className="h-4 w-4 mr-2" />
                Folders
              </Button>
              <Button
                variant="outline"
                className="h-10 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/crm/leads" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Leads</span>
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{stats.total}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">Active in pipeline</span>
              {stats.thisWeek > 0 && (
                <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  +{stats.thisWeek} this week
                </span>
              )}
            </div>
          </Link>

          <Link href="/crm/leads" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Value</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.highValue}</div>
            <div className="text-xs text-slate-500 mt-1">Score ≥ 80</div>
          </Link>

          <Link href="/crm/deals" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipeline Value</span>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(metrics?.deals.totalValue || 0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics?.deals.total || 0} active deals
            </div>
          </Link>

          <Link href="/crm/contacts" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Contacts</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {metrics?.contacts.total || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">In CRM</span>
              {metrics?.contacts.thisWeek ? (
                <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                  +{metrics.contacts.thisWeek} this week
                </span>
              ) : null}
            </div>
          </Link>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/inbox" className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{metrics?.messages.total || 0}</div>
                <div className="text-xs text-slate-500">Messages</div>
              </div>
            </div>
          </Link>

          <Link href="/crm/activities" className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{metrics?.appointments.upcoming || 0}</div>
                <div className="text-xs text-slate-500">Upcoming</div>
              </div>
            </div>
          </Link>

          <Link href="/settings/automations" className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{metrics?.automations.active_rules || 0}</div>
                <div className="text-xs text-slate-500">Automations</div>
              </div>
            </div>
          </Link>

          <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-cyan-400">{stats.avgScore}</div>
                <div className="text-xs text-slate-500">Avg Score</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">
                  {formatCurrency(metrics?.deals.wonValue || 0)}
                </div>
                <div className="text-xs text-slate-500">Won Value</div>
              </div>
            </div>
          </div>
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

        {/* Industry Quick Filters - Refined */}
        {industries.length > 0 && (
          <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Filter by Industry:</span>
              <Button
                onClick={() => setFilter(undefined)}
                variant="outline"
                size="sm"
                className={`h-8 border-white/10 text-xs ${
                  !filter?.industry
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                    : "text-slate-300 hover:bg-white/5"
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
                  className={`h-8 border-white/10 text-xs ${
                    filter?.industry === industry
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {industry} ({count})
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Leads Table - Professional Design */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedFolder ? `Folder: ${selectedFolder}` : "Lead Pipeline"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {leads.length} active leads • Click to view or call
              </p>
            </div>

            {filter && (
              <Button
                onClick={() => setFilter(undefined)}
                variant="outline"
                size="sm"
                className="h-8 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
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

        {/* Industry Breakdown (bottom section) - Cleaner Design */}
        {industries.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
            <h3 className="text-base font-semibold text-white mb-4 uppercase tracking-wide">Industry Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {industries.map(([industry, count]) => (
                <button
                  key={industry}
                  onClick={() => setFilter({ ...filter, industry })}
                  className="rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:bg-slate-800/50 hover:border-cyan-500/40 transition-all text-left group"
                >
                  <div className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{industry}</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-2">{count}</div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">leads</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lead Discovery Modal */}
        {showDiscoveryModal && (
          <div className="fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" onClick={() => { setShowDiscoveryModal(false); setDiscoveryResult(null); }} />
            {/* Scrollable container */}
            <div className="relative flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch p-4 pt-8 md:pt-4 md:flex md:items-center md:justify-center">
              <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl mx-auto mb-8 md:mb-0">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Discover New Leads</h2>
                      <p className="text-sm text-slate-400">AI-powered lead discovery with automatic enrichment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDiscoveryModal(false);
                      setDiscoveryResult(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {!discoveryResult ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={discoveryIndustry}
                          onChange={(e) => setDiscoveryIndustry(e.target.value)}
                          placeholder="e.g., restaurants, fitness, retail"
                          className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          disabled={discoveryLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={discoveryLocation}
                          onChange={(e) => setDiscoveryLocation(e.target.value)}
                          placeholder="e.g., San Diego, CA"
                          className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          disabled={discoveryLoading}
                        />
                      </div>

                      <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-slate-300">
                            <p className="font-medium mb-1">AI-Powered Discovery</p>
                            <p className="text-slate-400">
                              Our AI will search Google Maps, analyze businesses, and automatically enrich leads
                              with website scores, social presence, and opportunity ratings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleDiscoverLeads}
                        disabled={discoveryLoading || !discoveryIndustry.trim() || !discoveryLocation.trim()}
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {discoveryLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Discovering Leads...
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4 mr-2" />
                            Discover Leads
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowDiscoveryModal(false)}
                        variant="outline"
                        disabled={discoveryLoading}
                        className="border-white/10 text-slate-300 hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {discoveryResult.error ? (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{discoveryResult.error}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Discovery Complete!</h3>
                              <p className="text-sm text-slate-400">{discoveryResult.message}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-white">{discoveryResult.discovered}</div>
                              <div className="text-xs text-slate-400">Discovered</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-emerald-400">{discoveryResult.created}</div>
                              <div className="text-xs text-slate-400">Created</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-cyan-400">{discoveryResult.enriched}</div>
                              <div className="text-xs text-slate-400">Enriched</div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setShowDiscoveryModal(false);
                            setDiscoveryResult(null);
                            setDiscoveryIndustry("");
                            setDiscoveryLocation("");
                          }}
                          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                        >
                          Done
                        </Button>
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
            className={`fixed z-50 bg-slate-900 border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
              copilotMinimized
                ? "bottom-6 right-6 w-80 h-16 rounded-2xl"
                : "inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] rounded-2xl"
            }`}
          >
        {/* Copilot Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Copilot</div>
              <div className="text-xs text-slate-400">Always here to help</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCopilotMinimized(!copilotMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copilotMinimized ? (
                <Maximize2 className="h-4 w-4 text-slate-400" />
              ) : (
                <Minimize2 className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={() => setCopilotOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
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
                        ? "bg-cyan-500/20 border border-cyan-500/30 text-white"
                        : "bg-slate-800/50 border border-white/10 text-slate-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3">
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
            <div className="flex-shrink-0 border-t border-white/10 p-4">
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
                  className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  disabled={copilotLoading}
                />
                <button
                  onClick={handleCopilotMessage}
                  disabled={copilotLoading || !copilotInput.trim()}
                  className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
