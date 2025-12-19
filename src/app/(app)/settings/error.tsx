"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Settings Error</h2>
          <p className="text-slate-400">
            Failed to load settings. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="text-sm text-red-400/80 mt-2 font-mono bg-red-500/10 p-2 rounded">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
