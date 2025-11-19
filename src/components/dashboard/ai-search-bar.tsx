"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      // Call AI-powered search API
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

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
      setSearchResults({
        success: false,
        message: "Search failed. Please try again or refine your query.",
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
    <Card className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6 shadow-lg shadow-cyan-500/10">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Sparkles className="h-6 w-6 text-white" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-1">
            AI Lead Search Engine
          </h2>
          <p className="text-sm text-slate-400">
            Describe the businesses you want to find in natural language. Our AI will search the web and populate your leads table.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Try: "Find 25 HVAC companies in San Diego with less than 4.5 star ratings"'
            className="h-14 pl-4 pr-4 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-cyan-500 text-base"
            disabled={isSearching}
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/30 disabled:opacity-50"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div
          className={`mb-4 p-4 rounded-2xl border ${
            searchResults.success
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              searchResults.success ? "text-green-400" : "text-red-400"
            }`}
          >
            {searchResults.message}
          </p>
          {searchResults.success && searchResults.leadsAdded !== undefined && (
            <p className="text-xs text-slate-400 mt-1">
              Found {searchResults.leadsFound} businesses, added {searchResults.leadsAdded} new leads to your table
            </p>
          )}
        </div>
      )}

      {/* Example Queries */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Lightbulb className="h-4 w-4" />
          <span>Example searches:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {exampleQueries.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isSearching}
              className="text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500 mb-1">Powered by</div>
          <div className="text-sm font-semibold text-cyan-400">Claude AI</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Data Sources</div>
          <div className="text-sm font-semibold text-cyan-400">Web Search</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Auto-Scoring</div>
          <div className="text-sm font-semibold text-cyan-400">Enabled</div>
        </div>
      </div>
    </Card>
  );
}
