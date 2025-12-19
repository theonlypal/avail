"use client";

import { Loader2, Calendar } from "lucide-react";

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-cyan-500/20 rounded-xl animate-pulse flex items-center justify-center">
            <Calendar className="h-8 w-8 text-cyan-500/40" />
          </div>
          <div className="h-8 w-48 bg-slate-800/50 rounded mx-auto animate-pulse" />
          <div className="h-4 w-72 bg-slate-800/30 rounded mx-auto animate-pulse" />
        </div>

        {/* Calendar skeleton */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-6">
          {/* Month header */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-slate-800/40 rounded-lg animate-pulse" />
            <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-10 w-10 bg-slate-800/40 rounded-lg animate-pulse" />
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((_, i) => (
              <div key={i} className="h-8 bg-slate-800/30 rounded animate-pulse" />
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-800/20 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Time slots skeleton */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-800/50 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-800/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading calendar...</span>
        </div>
      </div>
    </div>
  );
}
