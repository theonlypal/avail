"use client";

import { Loader2 } from "lucide-react";

export default function LeadsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-36 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-800/30 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-slate-800/50 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-cyan-500/30 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-72 bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-800/40 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-800/40 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-slate-800/30 rounded-lg animate-pulse" />
        </div>

        {/* Lead cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-white/10 rounded-xl p-5 space-y-4"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-800/50 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-800/30 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-cyan-500/20 rounded-lg animate-pulse" />
              </div>

              {/* Card content */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-800/30 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-800/20 rounded animate-pulse" />
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-slate-800/40 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-slate-800/40 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-slate-800/30 rounded-full animate-pulse" />
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-slate-800/40 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-slate-800/30 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading leads...</span>
        </div>
      </div>
    </div>
  );
}
