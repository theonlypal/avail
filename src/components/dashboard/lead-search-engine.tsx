"use client";

import { useState } from "react";
import { Search, Loader2, Download, Plus, MapPin, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Lead } from "@/types";

const INDUSTRIES = [
  "HVAC",
  "Plumbing",
  "Dental",
  "Legal Services",
  "Real Estate",
  "Restaurant",
  "Auto Repair",
  "Beauty Salon",
  "Fitness Center",
  "All Industries"
];

const SOURCES = [
  { id: "google", name: "Google Maps", enabled: true },
  { id: "yelp", name: "Yelp", enabled: true },
  { id: "apollo", name: "Apollo.io", enabled: false }
];

export function LeadSearchEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [location, setLocation] = useState("San Diego, CA");
  const [sources, setSources] = useState(SOURCES.map(s => s.id));
  const [ratingRange, setRatingRange] = useState([3.0, 5.0]);
  const [reviewRange, setReviewRange] = useState([10, 500]);
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [resultLimit, setResultLimit] = useState(20);
  const [enrichWithEmails, setEnrichWithEmails] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry === "All Industries" ? "" : selectedIndustry,
          city: location,
          sources,
          limit: resultLimit,
          enrichWithEmails
        })
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      const leads = data.leads || [];

      // Apply client-side filters
      const filteredLeads = leads.filter((lead: Lead) => {
        const matchesRating = lead.rating >= ratingRange[0] && lead.rating <= ratingRange[1];
        const matchesReviews = lead.review_count >= reviewRange[0] && lead.review_count <= reviewRange[1];
        const matchesScore = lead.opportunity_score >= scoreRange[0] && lead.opportunity_score <= scoreRange[1];
        return matchesRating && matchesReviews && matchesScore;
      });

      setSearchResults(filteredLeads);

      // Add to search history
      const historyEntry = `${selectedIndustry} in ${location}`;
      setSearchHistory(prev => [historyEntry, ...prev.filter(h => h !== historyEntry)].slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleImportSelected = async () => {
    if (selectedLeads.size === 0) {
      alert("Please select at least one lead to import");
      return;
    }

    const leadsToImport = searchResults.filter(lead => selectedLeads.has(lead.id));

    try {
      for (const lead of leadsToImport) {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead)
        });
      }

      alert(`Successfully imported ${leadsToImport.length} leads!`);
      setSelectedLeads(new Set());
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import leads. Please try again.");
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Business Name", "Industry", "Location", "Phone", "Email", "Rating", "Reviews", "Opportunity Score"],
      ...searchResults.map(lead => [
        lead.business_name,
        lead.industry,
        lead.location,
        lead.phone || "",
        lead.email || "",
        lead.rating,
        lead.review_count,
        lead.opportunity_score
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leadly-search-results-${Date.now()}.csv`;
    a.click();
  };

  const toggleSource = (sourceId: string) => {
    setSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Lead Search Engine</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-white">Industry</Label>
            <select
              id="industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
            >
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-white">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Results Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-white">Results Limit: {resultLimit}</Label>
            <Slider
              id="limit"
              min={10}
              max={100}
              step={10}
              value={[resultLimit]}
              onValueChange={(value) => setResultLimit(value[0])}
              className="py-4"
            />
          </div>

          {/* Rating Range */}
          <div className="space-y-2">
            <Label className="text-white">
              Rating: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)} ⭐
            </Label>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={ratingRange}
              onValueChange={setRatingRange}
              className="py-4"
            />
          </div>

          {/* Review Count Range */}
          <div className="space-y-2">
            <Label className="text-white">
              Reviews: {reviewRange[0]} - {reviewRange[1]}
            </Label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={reviewRange}
              onValueChange={setReviewRange}
              className="py-4"
            />
          </div>

          {/* Opportunity Score Range */}
          <div className="space-y-2">
            <Label className="text-white">
              Opportunity Score: {scoreRange[0]} - {scoreRange[1]}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={scoreRange}
              onValueChange={setScoreRange}
              className="py-4"
            />
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-6 space-y-2">
          <Label className="text-white">Data Sources</Label>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(source => (
              <button
                key={source.id}
                onClick={() => source.enabled && toggleSource(source.id)}
                disabled={!source.enabled}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  sources.includes(source.id)
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-white/5 border-white/10 text-slate-400"
                } ${!source.enabled ? "opacity-50 cursor-not-allowed" : "hover:border-cyan-500/30"}`}
              >
                {source.name}
                {!source.enabled && " (Coming Soon)"}
              </button>
            ))}
          </div>
        </div>

        {/* Email Enrichment */}
        <div className="mt-6">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={enrichWithEmails}
              onChange={(e) => setEnrichWithEmails(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500"
            />
            <span>Enrich with email addresses (slower, uses Hunter.io credits)</span>
          </label>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleSearch}
            disabled={isSearching || sources.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Leads
              </>
            )}
          </Button>

          {searchResults.length > 0 && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <Label className="text-slate-400 text-sm">Recent Searches:</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {searchHistory.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const [industry, ...locationParts] = search.split(" in ");
                    setSelectedIndustry(industry);
                    setLocation(locationParts.join(" in "));
                  }}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Search Results</h3>
              <p className="text-slate-400 text-sm">
                Found {searchResults.length} leads matching your criteria
              </p>
            </div>

            {selectedLeads.size > 0 && (
              <Button
                onClick={handleImportSelected}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Import {selectedLeads.size} Selected
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {searchResults.map(lead => (
              <div
                key={lead.id}
                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                  selectedLeads.has(lead.id)
                    ? "bg-cyan-500/10 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                }`}
                onClick={() => handleSelectLead(lead.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{lead.business_name}</h4>
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {lead.industry}
                      </Badge>
                      {lead.source && (
                        <Badge variant="outline" className="border-white/20 text-slate-400">
                          {lead.source}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.location}
                      </span>

                      {lead.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {lead.rating.toFixed(1)} ({lead.review_count} reviews)
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Score: {lead.opportunity_score}
                      </span>

                      {lead.phone && (
                        <span>{lead.phone}</span>
                      )}

                      {lead.email && (
                        <span>{lead.email}</span>
                      )}
                    </div>

                    {lead.pain_points && lead.pain_points.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {lead.pain_points.slice(0, 3).map((pain, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                            >
                              {pain}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      lead.opportunity_score >= 80
                        ? "bg-green-500/20 text-green-400"
                        : lead.opportunity_score >= 60
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}>
                      <span className="text-lg font-bold">{lead.opportunity_score}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && searchHistory.length > 0 && (
        <Card className="rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center">
          <p className="text-slate-400">
            No results yet. Configure your search criteria and click "Search Leads" to begin.
          </p>
        </Card>
      )}
    </div>
  );
}
