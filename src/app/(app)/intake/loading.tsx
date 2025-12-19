"use client";

import { Loader2, ClipboardList } from "lucide-react";

export default function IntakeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-cyan-500/20 rounded-xl animate-pulse flex items-center justify-center">
            <ClipboardList className="h-8 w-8 text-cyan-500/40" />
          </div>
          <div className="h-8 w-56 bg-slate-800/50 rounded mx-auto animate-pulse" />
          <div className="h-4 w-80 bg-slate-800/30 rounded mx-auto animate-pulse" />
        </div>

        {/* Progress indicator skeleton */}
        <div className="flex items-center justify-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-8 h-8 bg-slate-800/40 rounded-full animate-pulse" />
              {i < 3 && <div className="w-12 h-1 bg-slate-800/30 mx-2 animate-pulse" />}
            </div>
          ))}
        </div>

        {/* Form skeleton */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-8 space-y-6">
          {/* Form fields */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-12 w-full bg-slate-800/30 rounded-lg animate-pulse" />
            </div>
          ))}

          {/* Textarea */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-24 w-full bg-slate-800/30 rounded-lg animate-pulse" />
          </div>

          {/* Submit button */}
          <div className="h-12 w-full bg-cyan-500/30 rounded-lg animate-pulse" />
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          <span className="ml-2 text-slate-400">Loading intake form...</span>
        </div>
      </div>
    </div>
  );
}
