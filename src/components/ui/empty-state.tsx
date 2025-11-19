/**
 * Empty State Components
 *
 * Professional empty states that guide users to action
 * Designed to be helpful, not disappointing
 *
 * Design Philosophy:
 * - Clear, actionable messaging
 * - Helpful illustrations/icons
 * - Prominent CTAs
 * - Matches AVAIL design system
 *
 * Usage:
 * <EmptyState
 *   icon={Inbox}
 *   title="No leads yet"
 *   description="Your leads will appear here once they start coming in."
 *   action={{ label: "View Demo", onClick: () => {} }}
 * />
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'p-6',
      icon: 'h-10 w-10',
      iconContainer: 'h-16 w-16',
      title: 'text-base',
      description: 'text-xs',
      buttonSize: 'sm' as const,
    },
    md: {
      container: 'p-8',
      icon: 'h-12 w-12',
      iconContainer: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
      buttonSize: 'default' as const,
    },
    lg: {
      container: 'p-12',
      icon: 'h-16 w-16',
      iconContainer: 'h-24 w-24',
      title: 'text-xl',
      description: 'text-base',
      buttonSize: 'lg' as const,
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
      role="status"
      aria-label="Empty state"
    >
      {Icon && (
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-full bg-muted',
            sizes.iconContainer
          )}
        >
          <Icon className={cn('text-muted-foreground', sizes.icon)} />
        </div>
      )}

      <h3 className={cn('font-semibold text-foreground mb-2', sizes.title)}>{title}</h3>

      {description && (
        <p className={cn('text-muted-foreground max-w-md mb-6', sizes.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={sizes.buttonSize}
              className="flex items-center gap-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              size={sizes.buttonSize}
              className="flex items-center gap-2"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Empty Table State - for tables with no data
 */
interface EmptyTableProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  columns?: number;
  className?: string;
}

export function EmptyTable({
  icon: Icon,
  title,
  description,
  action,
  columns = 4,
  className,
}: EmptyTableProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Table Header (optional - shows structure) */}
      <div className="flex gap-4 border-b border-border bg-muted/50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-muted" />
        ))}
      </div>

      {/* Empty State */}
      <EmptyState
        icon={Icon}
        title={title}
        description={description}
        action={action}
        size="md"
        className="py-12"
      />
    </div>
  );
}

/**
 * Empty List State - for lists with no items
 */
interface EmptyListProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyList({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyListProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <EmptyState
        icon={Icon}
        title={title}
        description={description}
        action={action}
        size="sm"
        className="py-8"
      />
    </div>
  );
}

/**
 * Empty Search State - for search with no results
 */
interface EmptySearchProps {
  query?: string;
  onClear?: () => void;
  suggestions?: string[];
  className?: string;
}

export function EmptySearch({
  query,
  onClear,
  suggestions,
  className,
}: EmptySearchProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-8 text-center', className)}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">No results found</h3>

      {query && (
        <p className="mb-4 text-sm text-muted-foreground">
          We couldn't find anything matching <strong className="text-foreground">"{query}"</strong>
        </p>
      )}

      {onClear && (
        <Button onClick={onClear} variant="outline" size="sm" className="mb-4">
          Clear search
        </Button>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Try searching for:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Empty Dashboard State - for dashboard with no data
 */
interface EmptyDashboardProps {
  onGetStarted?: () => void;
  className?: string;
}

export function EmptyDashboard({ onGetStarted, className }: EmptyDashboardProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-12 text-center',
        className
      )}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <svg
          className="h-12 w-12 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome to AVAIL</h2>

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Your dashboard is empty right now. Start by exploring our demos or connecting your first
        data source to see insights here.
      </p>

      {onGetStarted && (
        <Button onClick={onGetStarted} size="lg">
          Get Started
        </Button>
      )}
    </div>
  );
}

/**
 * Empty Card State - for cards with no content
 */
interface EmptyCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyCard({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-border bg-card/50 p-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      )}

      <h4 className="mb-1 text-sm font-semibold text-foreground">{title}</h4>

      {description && <p className="mb-4 text-xs text-muted-foreground">{description}</p>}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'outline'}
          size="sm"
          className="flex items-center gap-1.5"
        >
          {action.icon && <action.icon className="h-3 w-3" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty Filter State - for filtered views with no results
 */
interface EmptyFilterProps {
  onReset?: () => void;
  activeFilters?: string[];
  className?: string;
}

export function EmptyFilter({ onReset, activeFilters, className }: EmptyFilterProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-8 text-center', className)}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold text-foreground">No matches found</h3>

      <p className="mb-4 text-sm text-muted-foreground">
        No results match your current filters. Try adjusting your filters to see more results.
      </p>

      {activeFilters && activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {activeFilters.map((filter, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {filter}
            </span>
          ))}
        </div>
      )}

      {onReset && (
        <Button onClick={onReset} variant="outline" size="sm">
          Reset filters
        </Button>
      )}
    </div>
  );
}

// Export types for external use
export type {
  EmptyStateProps,
  EmptyStateAction,
  EmptyTableProps,
  EmptyListProps,
  EmptySearchProps,
  EmptyDashboardProps,
  EmptyCardProps,
  EmptyFilterProps,
};
