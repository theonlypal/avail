/**
 * Toast Notification Component
 *
 * Beautiful, animated toast notifications for user feedback
 * Designed to be delightful and non-intrusive
 *
 * Design Philosophy:
 * - Smooth entrance/exit animations
 * - Auto-dismiss with progress bar
 * - Multiple variants for different contexts
 * - Accessible and keyboard-friendly
 *
 * Usage:
 * import { toast } from '@/components/ui/toast-notification';
 * toast.success('Lead captured successfully!');
 * toast.error('Failed to save changes');
 * toast.info('New message received');
 */

'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration (default 5s)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:p-6 max-w-md w-full"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / duration) * 50; // Update every 50ms
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const config = getToastConfig(toast.variant);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg',
        'animate-slide-in-right',
        'bg-card text-card-foreground',
        config.borderColor
      )}
      role="alert"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-border">
        <div
          className={cn('h-full transition-all duration-50 ease-linear', config.progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Icon */}
        <div className={cn('flex-shrink-0 rounded-full p-1', config.iconBg)}>
          <config.icon className={cn('h-5 w-5', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>
          )}
          {toast.action && (
            <Button
              onClick={toast.action.onClick}
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
            >
              {toast.action.label}
            </Button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getToastConfig(variant: ToastVariant) {
  const configs = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      borderColor: 'border-green-200',
      progressColor: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      borderColor: 'border-red-200',
      progressColor: 'bg-red-500',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-500',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      progressColor: 'bg-yellow-500',
    },
  };

  return configs[variant];
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Convenience functions for imperative API
let toastContext: ToastContextType | null = null;

export function setToastContext(context: ToastContextType) {
  toastContext = context;
}

export const toast = {
  success: (title: string, description?: string, action?: Toast['action']) => {
    toastContext?.addToast({ variant: 'success', title, description, action });
  },
  error: (title: string, description?: string, action?: Toast['action']) => {
    toastContext?.addToast({ variant: 'error', title, description, action });
  },
  info: (title: string, description?: string, action?: Toast['action']) => {
    toastContext?.addToast({ variant: 'info', title, description, action });
  },
  warning: (title: string, description?: string, action?: Toast['action']) => {
    toastContext?.addToast({ variant: 'warning', title, description, action });
  },
  custom: (toast: Omit<Toast, 'id'>) => {
    toastContext?.addToast(toast);
  },
};

// Hook to initialize imperative API
export function useToastInit() {
  const context = useToast();

  useEffect(() => {
    setToastContext(context);
    return () => {
      toastContext = null;
    };
  }, [context]);
}
