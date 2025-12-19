"use client";

import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonShiny } from "@/components/ui/button-shiny";
import { MagicCard } from "@/components/ui/magic-card";

interface AISearchBarProps {
  onSearchComplete?: () => void;
}

const exampleQueries = [
  "Find 20 HVAC companies in San Diego with ratings below 4.5 stars",
  "Show me dental practices in Austin with no website",
  "Get plumbing businesses in Phoenix with over 100 reviews",
  "Find restaurants in Chicago with poor online presence",
  "Search for auto repair shops in Dallas without websites",
  "Find beauty salons in Seattle with low ratings",
];

export function AISearchBar({ onSearchComplete }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    success: boolean;
    message: string;
    leadsFound?: number;
    leadsAdded?: number;
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults(null);

    try {
      // Call AI-powered search API with extended timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      setSearchResults({
        success: true,
        message: data.message || "Search completed successfully",
        leadsFound: data.leadsFound,
        leadsAdded: data.leadsAdded,
      });

      // Refresh the leads table
      onSearchComplete?.();

    } catch (error) {
      console.error("AI search error:", error);
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? "Search timed out. The search is still processing - please refresh the page in a moment to see your results."
        : "Search failed. Please try again or refine your query.";

      setSearchResults({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <MagicCard
      className="p-6 bg-slate-900/40"
      gradientFrom="rgba(6, 182, 212, 0.08)"
      gradientTo="rgba(59, 130, 246, 0.04)"
      gradientSize={400}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-sm -z-10" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-1">
            AI Lead Search Engine
          </h2>
          <p className="text-sm text-slate-500">
            Describe the businesses you want to find in natural language. Our AI will search the web and populate your leads table.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Try: "Find 25 HVAC companies in San Diego with less than 4.5 star ratings"'
            className="w-full h-14 pl-12 pr-4 bg-slate-950/60 border border-white/[0.04] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all text-base"
            disabled={isSearching}
          />
        </div>

        <ButtonShiny
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          variant="cyan"
          className="h-14 px-8"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Search
            </span>
          )}
        </ButtonShiny>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div
          className={`mb-5 p-4 rounded-xl border ${
            searchResults.success
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              searchResults.success ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {searchResults.message}
          </p>
          {searchResults.success && searchResults.leadsAdded !== undefined && (
            <p className="text-xs text-slate-500 mt-1">
              Found {searchResults.leadsFound} businesses, added {searchResults.leadsAdded} new leads to your table
            </p>
          )}
        </div>
      )}

      {/* Example Queries */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span>Example searches:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {exampleQueries.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isSearching}
              className="text-xs px-3 py-2 rounded-lg bg-slate-950/60 border border-white/[0.04] text-slate-400 hover:bg-slate-900/60 hover:border-cyan-500/20 hover:text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-5 pt-5 border-t border-white/[0.04] grid grid-cols-3 gap-4">
        {[
          { label: "Powered by", value: "Claude AI", color: "text-cyan-400" },
          { label: "Data Sources", value: "Web Search", color: "text-purple-400" },
          { label: "Auto-Scoring", value: "Enabled", color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="text-center p-3 rounded-xl bg-slate-950/40 border border-white/[0.03]">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{item.label}</div>
            <div className={`text-sm font-semibold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>
    </MagicCard>
  );
}
