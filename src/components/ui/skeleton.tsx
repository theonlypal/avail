/**
 * Enhanced Skeleton Loading Components
 *
 * Professional skeleton screens for better perceived performance
 * Supports multiple variants and sizes
 *
 * Design Philosophy:
 * - Smooth shimmer animation (not distracting)
 * - Matches actual content dimensions
 * - Semantic HTML structure
 * - Accessibility support
 */

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse';
}

function Skeleton({
  className,
  variant = 'pulse',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'bg-accent',
    shimmer: 'bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%] animate-shimmer',
    pulse: 'bg-accent animate-pulse',
  };

  return (
    <div
      data-slot="skeleton"
      className={cn('rounded-md', variantClasses[variant], className)}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  )
}

/**
 * Text Skeleton - for loading text content
 */
interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Loading text...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-[80%]' : 'w-full' // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Card Skeleton - for loading card components
 */
interface CardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

function CardSkeleton({
  showHeader = true,
  showFooter = false,
  className,
}: CardSkeletonProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card p-6', className)}
      role="status"
      aria-label="Loading card..."
    >
      {showHeader && (
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      {showFooter && (
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      )}
    </div>
  );
}

/**
 * Table Skeleton - for loading table data
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-lg border border-border', className)}
      role="status"
      aria-label="Loading table..."
    >
      {showHeader && (
        <div className="flex gap-4 border-b border-border bg-muted/50 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  'h-4',
                  colIndex === 0 ? 'w-[20%]' : colIndex === columns - 1 ? 'w-[15%]' : 'flex-1'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List Skeleton - for loading list items
 */
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

function ListSkeleton({
  items = 5,
  showAvatar = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading list...">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Metric Skeleton
 */
function MetricSkeleton() {
  return (
    <div
      className="rounded-lg border border-border bg-card p-6"
      role="status"
      aria-label="Loading metric..."
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-3 w-[80px]" />
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 */
interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

function ChartSkeleton({ height = 300, className }: ChartSkeletonProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card p-6', className)}
      role="status"
      aria-label="Loading chart..."
    >
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-[150px]" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
      <div className="mt-4 flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Avatar Skeleton
 */
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function AvatarSkeleton({ size = 'md', className }: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      aria-label="Loading avatar..."
    />
  );
}

/**
 * Form Skeleton
 */
interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  className?: string;
}

function FormSkeleton({ fields = 4, showButtons = true, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Loading form...">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showButtons && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      )}
    </div>
  );
}

/**
 * Page Skeleton
 */
function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page...">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <CardSkeleton showHeader showFooter />
        </div>
      </div>
    </div>
  );
}

/**
 * Chat Message Skeleton
 */
function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 p-4" role="status" aria-label="Loading message...">
      <AvatarSkeleton size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-[100px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </div>
  );
}

/**
 * Sidebar Navigation Skeleton
 */
function NavSkeleton() {
  return (
    <div className="space-y-2 p-2" role="status" aria-label="Loading navigation...">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md p-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  MetricSkeleton,
  ChartSkeleton,
  AvatarSkeleton,
  FormSkeleton,
  PageSkeleton,
  ChatMessageSkeleton,
  NavSkeleton,
}
