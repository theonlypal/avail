'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Users } from 'lucide-react';
import Link from 'next/link';

export default function CRMError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CRM page error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
          <div className="relative rounded-full h-20 w-20 bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-slate-400">
            We encountered an error while loading the CRM. This might be a temporary issue.
          </p>
          {error.message && (
            <p className="text-sm text-red-400/80 bg-red-500/10 rounded-lg px-4 py-2 mt-4 border border-red-500/20">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-3">Or try these quick actions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Link href="/leads">
                <Users className="h-3 w-3 mr-2" />
                View Leads
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
