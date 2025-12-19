"use client";

import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-800/30 rounded animate-pulse" />
        </div>

        {/* Settings sections skeleton */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-4 w-72 bg-slate-800/30 rounded animate-pulse" />
              </div>
              <div className="h-10 w-24 bg-slate-800/40 rounded-lg animate-pulse" />
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-slate-800/30 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-slate-800/40 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading settings...</span>
        </div>
      </div>
    </div>
  );
}
