/**
 * Leadly.AI Dashboard - Modern Professional Edition
 *
 * Primary focus: Clean interface with integrated AI Copilot
 * Natural language queries to find and populate leads
 */

"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Folder, Plus, Settings, MessageSquare, Send, X, Minimize2, Maximize2, Bot } from "lucide-react";
import type { LeadFilter } from "@/types";
import { fetchLeads } from "@/lib/leads-client";
import { LeadTable } from "@/components/dashboard/lead-table";
import { AISearchBar } from "@/components/dashboard/ai-search-bar";
import { FolderManager } from "@/components/dashboard/folder-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<LeadFilter | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderManager, setShowFolderManager] = useState(false);

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
                  Leadly.AI
                </h1>
                <p className="text-sm text-slate-400">
                  AI-Powered Lead Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

        {/* Metrics Grid - More Professional */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Leads</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Active in pipeline</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Value</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.highValue}</div>
            <div className="text-xs text-slate-500 mt-1">Score ≥ 80</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Score</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">{stats.avgScore}</div>
            <div className="text-xs text-slate-500 mt-1">Opportunity rating</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Industries</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{industries.length}</div>
            <div className="text-xs text-slate-500 mt-1">Unique sectors</div>
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

        {/* AI Copilot Floating Widget */}
        {copilotOpen && (
          <div
            className={`fixed bottom-6 right-6 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              copilotMinimized ? "w-80 h-16" : "w-96 h-[600px]"
            }`}
          >
        {/* Copilot Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10 p-4 flex items-center justify-between">
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
            <div className="h-[calc(100%-128px)] overflow-y-auto p-4 space-y-4">
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
            <div className="border-t border-white/10 p-4">
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
