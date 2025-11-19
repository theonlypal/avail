/**
 * Error Tracking Utility Library
 *
 * Centralized error handling and logging for AVAIL
 * Supports multiple environments and error tracking services
 *
 * Features:
 * - Structured error logging
 * - Context enrichment (user, session, page)
 * - Rate limiting to prevent log spam
 * - Integration-ready for Sentry, LogRocket, etc.
 *
 * Usage:
 * import { logError, logWarning, logInfo } from '@/lib/error-tracking';
 * logError(new Error('Something failed'), { component: 'ChatSidebar' });
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  url?: string;
  userAgent?: string;
}

export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

interface ErrorLog {
  severity: ErrorSeverity;
  message: string;
  error?: Error;
  context: ErrorContext;
  timestamp: string;
}

class ErrorTracker {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100;
  private rateLimitMap: Map<string, number> = new Map();
  private rateLimitWindow: number = 60000; // 1 minute
  private rateLimitMax: number = 10; // Max 10 errors per minute per key

  constructor() {
    // Clean up rate limit map periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupRateLimitMap(), this.rateLimitWindow);
    }
  }

  /**
   * Check if error should be rate limited
   */
  private shouldRateLimit(key: string): boolean {
    const now = Date.now();
    const count = this.rateLimitMap.get(key) || 0;

    if (count >= this.rateLimitMax) {
      return true;
    }

    this.rateLimitMap.set(key, count + 1);
    return false;
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupRateLimitMap(): void {
    this.rateLimitMap.clear();
  }

  /**
   * Enrich context with browser/environment information
   */
  private enrichContext(context: ErrorContext): ErrorContext {
    const enriched: ErrorContext = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      enriched.url = enriched.url || window.location.href;
      enriched.userAgent = enriched.userAgent || navigator.userAgent;
    }

    return enriched;
  }

  /**
   * Core logging method
   */
  private log(
    severity: ErrorSeverity,
    message: string,
    error?: Error,
    context?: ErrorContext
  ): void {
    const enrichedContext = this.enrichContext(context || {});
    const errorLog: ErrorLog = {
      severity,
      message,
      error,
      context: enrichedContext,
      timestamp: enrichedContext.timestamp!,
    };

    // Rate limit based on message
    const rateLimitKey = `${severity}:${message}`;
    if (this.shouldRateLimit(rateLimitKey)) {
      return;
    }

    // Add to in-memory logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output (development)
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(errorLog);
    }

    // Send to external service (production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorLog);
    }
  }

  /**
   * Log to browser console with formatting
   */
  private logToConsole(errorLog: ErrorLog): void {
    const prefix = '[LeadlyAI Error Tracker]';
    const style = this.getConsoleStyle(errorLog.severity);

    console.group(`%c${prefix} ${errorLog.severity.toUpperCase()}`, style);
    console.log('Message:', errorLog.message);
    if (errorLog.error) {
      console.error('Error:', errorLog.error);
    }
    if (Object.keys(errorLog.context).length > 0) {
      console.log('Context:', errorLog.context);
    }
    console.log('Timestamp:', errorLog.timestamp);
    console.groupEnd();
  }

  /**
   * Get console styling based on severity
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles: Record<ErrorSeverity, string> = {
      [ErrorSeverity.FATAL]: 'color: white; background: #dc2626; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      [ErrorSeverity.ERROR]: 'color: white; background: #ef4444; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      [ErrorSeverity.WARNING]: 'color: white; background: #f59e0b; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      [ErrorSeverity.INFO]: 'color: white; background: #3b82f6; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      [ErrorSeverity.DEBUG]: 'color: white; background: #6b7280; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    };
    return styles[severity];
  }

  /**
   * Send error to external tracking service
   * TODO: Integrate with Sentry, LogRocket, or other service
   */
  private sendToExternalService(errorLog: ErrorLog): void {
    // Example: Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.captureException(errorLog.error || new Error(errorLog.message), {
    //     level: errorLog.severity,
    //     extra: errorLog.context,
    //   });
    // }

    // Example: Custom API endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // }).catch(() => {
    //   // Silently fail - don't create error loops
    // });
  }

  /**
   * Public API: Log fatal error
   */
  public fatal(message: string, error?: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.FATAL, message, error, context);
  }

  /**
   * Public API: Log error
   */
  public error(message: string, error?: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.ERROR, message, error, context);
  }

  /**
   * Public API: Log warning
   */
  public warning(message: string, error?: Error, context?: ErrorContext): void {
    this.log(ErrorSeverity.WARNING, message, error, context);
  }

  /**
   * Public API: Log info
   */
  public info(message: string, context?: ErrorContext): void {
    this.log(ErrorSeverity.INFO, message, undefined, context);
  }

  /**
   * Public API: Log debug
   */
  public debug(message: string, context?: ErrorContext): void {
    this.log(ErrorSeverity.DEBUG, message, undefined, context);
  }

  /**
   * Get recent logs (for debugging)
   */
  public getRecentLogs(count: number = 20): ErrorLog[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs by severity
   */
  public getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Export logs (for debugging or support)
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
const errorTracker = new ErrorTracker();

// Export convenience functions
export const logFatal = (message: string, error?: Error, context?: ErrorContext): void => {
  errorTracker.fatal(message, error, context);
};

export const logError = (message: string, error?: Error, context?: ErrorContext): void => {
  errorTracker.error(message, error, context);
};

export const logWarning = (message: string, error?: Error, context?: ErrorContext): void => {
  errorTracker.warning(message, error, context);
};

export const logInfo = (message: string, context?: ErrorContext): void => {
  errorTracker.info(message, context);
};

export const logDebug = (message: string, context?: ErrorContext): void => {
  errorTracker.debug(message, context);
};

export const getRecentLogs = (count?: number): ErrorLog[] => {
  return errorTracker.getRecentLogs(count);
};

export const clearLogs = (): void => {
  errorTracker.clearLogs();
};

export const exportLogs = (): string => {
  return errorTracker.exportLogs();
};

// Export tracker instance for advanced usage
export { errorTracker, ErrorTracker };

// Export types
export type { ErrorLog };

/**
 * React Hook: useErrorTracking
 *
 * Provides error tracking within React components
 */
export function useErrorTracking(componentName: string) {
  const trackError = React.useCallback(
    (message: string, error?: Error, additionalContext?: Omit<ErrorContext, 'component'>) => {
      logError(message, error, {
        component: componentName,
        ...additionalContext,
      });
    },
    [componentName]
  );

  const trackWarning = React.useCallback(
    (message: string, error?: Error, additionalContext?: Omit<ErrorContext, 'component'>) => {
      logWarning(message, error, {
        component: componentName,
        ...additionalContext,
      });
    },
    [componentName]
  );

  const trackInfo = React.useCallback(
    (message: string, additionalContext?: Omit<ErrorContext, 'component'>) => {
      logInfo(message, {
        component: componentName,
        ...additionalContext,
      });
    },
    [componentName]
  );

  return {
    trackError,
    trackWarning,
    trackInfo,
  };
}

/**
 * Async error wrapper
 * Catches errors from async functions and logs them
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(
      'Async operation failed',
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    return null;
  }
}

/**
 * Performance tracking helper
 */
export class PerformanceTracker {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(threshold: number = 1000): void {
    const duration = performance.now() - this.startTime;

    if (duration > threshold) {
      logWarning(`Performance: ${this.label} took ${duration.toFixed(2)}ms`, undefined, {
        action: 'performance',
        metadata: { duration, threshold },
      });
    }
  }
}

// Add React import for the hook
import React from 'react';
