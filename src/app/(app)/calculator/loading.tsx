"use client";

import { Loader2, Calculator } from "lucide-react";

export default function CalculatorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-cyan-500/20 rounded-xl animate-pulse flex items-center justify-center">
            <Calculator className="h-8 w-8 text-cyan-500/40" />
          </div>
          <div className="h-8 w-64 bg-slate-800/50 rounded mx-auto animate-pulse" />
          <div className="h-4 w-96 bg-slate-800/30 rounded mx-auto animate-pulse" />
        </div>

        {/* Calculator form skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input section */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />

            {/* Slider inputs */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-800/40 rounded animate-pulse" />
                </div>
                <div className="h-3 w-full bg-slate-800/30 rounded-full animate-pulse" />
              </div>
            ))}

            {/* Calculate button */}
            <div className="h-12 w-full bg-cyan-500/30 rounded-lg animate-pulse" />
          </div>

          {/* Results section */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="h-6 w-28 bg-slate-800/50 rounded animate-pulse" />

            {/* Result cards */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-lg p-4 space-y-2">
                <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-8 w-32 bg-slate-800/40 rounded animate-pulse" />
              </div>
            ))}

            {/* Comparison chart */}
            <div className="h-40 bg-slate-800/20 rounded-lg animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-cyan-500/30 animate-spin" />
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading calculator...</span>
        </div>
      </div>
    </div>
  );
}
