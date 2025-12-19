"use client";

/**
 * Demos Live - Parent page
 *
 * Redirects to the main demos page since there's no standalone
 * demos-live landing page. Individual demos are at /demos-live/[demo].
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemosLivePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main demos page
    router.replace("/demos");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Redirecting to demos...</p>
      </div>
    </div>
  );
}
