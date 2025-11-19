/**
 * Global Error Boundary Component
 *
 * Catches React errors anywhere in the component tree and displays
 * a professional fallback UI instead of crashing the entire app
 *
 * Design Philosophy:
 * - Professional, not alarming
 * - Provides actionable recovery options
 * - Logs errors for debugging
 * - Matches AVAIL design system
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[LeadlyAI ErrorBoundary] Caught error:', error);
      console.error('[LeadlyAI ErrorBoundary] Error info:', errorInfo);
    }

    // Update state with error details
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error tracking service
    // TODO: Integrate with Sentry, LogRocket, or similar
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/dashboard';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl">
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-8 shadow-sm">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  Something went wrong
                </h1>
                <p className="mb-6 text-sm text-gray-700">
                  We encountered an unexpected error. This has been logged and we'll look into it.
                  In the meantime, try one of the recovery options below.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && (
                <details className="mt-6 rounded-md border border-red-300 bg-white p-4">
                  <summary className="flex cursor-pointer items-center gap-2 font-semibold text-red-900">
                    <FileText className="h-4 w-4" />
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-4 space-y-3">
                    {this.state.error && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-900">Error Message:</p>
                        <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs text-red-700">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-900">Component Stack:</p>
                        <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-700">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support Info */}
              <div className="mt-6 border-t border-red-200 pt-4 text-center">
                <p className="text-xs text-gray-600">
                  If this problem persists, please contact{' '}
                  <a
                    href="mailto:support@leadly.ai"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    support@leadly.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Minimal Error Fallback for Inline Components
 */
interface InlineErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  message?: string;
}

export function InlineErrorFallback({
  error,
  onRetry,
  message = 'Something went wrong loading this component',
}: InlineErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900">{message}</p>
          {error && process.env.NODE_ENV === 'development' && (
            <p className="mt-1 text-xs text-red-700">{error.message}</p>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for functional components to handle errors gracefully
 */
export function useErrorHandler(
  callback?: (error: Error) => void
): (error: Error) => void {
  return React.useCallback(
    (error: Error) => {
      // Log to console
      console.error('[LeadlyAI useErrorHandler]:', error);

      // Call custom callback
      if (callback) {
        callback(error);
      }

      // In production, send to error tracking
      if (process.env.NODE_ENV === 'production') {
        // logErrorToService(error);
      }
    },
    [callback]
  );
}
