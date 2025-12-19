"use client";

import { Loader2 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-800/30 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>

        {/* KPI cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-3"
            >
              <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-10 w-20 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800/30 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4"
            >
              <div className="h-5 w-36 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-56 bg-slate-800/20 rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-cyan-500/30 animate-spin" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
