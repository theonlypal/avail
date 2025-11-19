/**
 * API Status Indicator Component
 *
 * Shows the connection status of the AI Copilot (Anthropic Claude API)
 * Displays color-coded indicator and helpful messages
 *
 * Status colors:
 * - Green: API is configured and working
 * - Yellow: API key is missing
 * - Red: API key is invalid or error occurred
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HealthStatus {
  anthropicConfigured: boolean;
  model: string;
  status: 'ready' | 'missing_key' | 'invalid_key' | 'error';
  message?: string;
  timestamp: string;
}

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/ai/health');
        const data: HealthStatus = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('[LeadlyAI] Failed to check AI health:', error);
        setStatus({
          anthropicConfigured: false,
          model: 'claude-3-5-sonnet-20240620',
          status: 'error',
          message: 'Unable to check API status',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkHealth();

    // Re-check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        <span>Checking status...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status.status) {
      case 'ready':
        return {
          color: 'bg-green-500',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          label: 'Online',
          message: 'AI Copilot is connected and ready',
        };
      case 'missing_key':
        return {
          color: 'bg-yellow-500',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          label: 'Not Configured',
          message: 'Add ANTHROPIC_API_KEY to .env.local to enable AI features',
        };
      case 'invalid_key':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          label: 'Invalid Key',
          message: 'Your ANTHROPIC_API_KEY is invalid. Please check your configuration.',
        };
      case 'error':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          label: 'Error',
          message: status.message || 'An error occurred. Please try again later.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // If API is not ready, show warning banner
  if (status.status !== 'ready') {
    return (
      <div className="mx-4 my-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-2">
          <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.iconColor)} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-yellow-900">{config.label}</p>
            <p className="text-xs text-yellow-800 mt-0.5">{config.message}</p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-yellow-700 hover:text-yellow-900 font-medium mt-2 inline-flex items-center gap-1"
            >
              Get API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If ready, show minimal status indicator
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-help">
            <div className={cn('w-2 h-2 rounded-full', config.color)} />
            <span className="font-medium">{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{config.message}</p>
          <p className="text-muted-foreground mt-1">Model: {status.model}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
