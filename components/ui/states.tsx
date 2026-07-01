import { ApiError } from '@/lib/api-client';
import { COPY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ─── Primitive skeleton block ───────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-slate-200/80', className)} />;
}

// ─── Page heading skeleton ───────────────────────────────────────────────────
export function PageHeadingSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      {hasAction && <Skeleton className="h-10 w-28 rounded-md" />}
    </div>
  );
}

// ─── Single card skeleton ─────────────────────────────────────────────────────
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// ─── Match card skeleton ──────────────────────────────────────────────────────
export function MatchCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// ─── Card grid skeleton ────────────────────────────────────────────────────────
export function CardGridSkeleton({
  count = 6,
  variant = 'default',
}: {
  count?: number;
  variant?: 'default' | 'match';
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) =>
        variant === 'match' ? <MatchCardSkeleton key={i} /> : <CardSkeleton key={i} />,
      )}
    </div>
  );
}

// ─── List page skeleton (heading + optional filter + grid) ────────────────────
export function ListPageSkeleton({
  filterRows = 1,
  count = 6,
  variant = 'default',
  hasAction = false,
}: {
  filterRows?: number;
  count?: number;
  variant?: 'default' | 'match';
  hasAction?: boolean;
}) {
  return (
    <div>
      <PageHeadingSkeleton hasAction={hasAction} />
      {filterRows > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {Array.from({ length: filterRows * 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-36 rounded-md" />
          ))}
        </div>
      )}
      <CardGridSkeleton count={count} variant={variant} />
    </div>
  );
}

// ─── Detail page skeleton ──────────────────────────────────────────────────────
export function DetailSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
      {/* Content sections */}
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            {i === 0 && <Skeleton className="h-4 w-3/5" />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ className, label = '載入中…' }: { className?: string; label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-slate-500', className)}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="載入中" className="grid gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200/70" />
      ))}
    </div>
  );
}

export function EmptyState({
  message = COPY.empty,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-12 text-slate-500',
        className,
      )}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function PermissionError({ message = COPY.forbidden }: { message?: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  // A 403 surfaced into a list view becomes a permission notice, per the RBAC spec.
  if (error instanceof ApiError && error.isForbidden) {
    return <PermissionError />;
  }

  const message =
    error instanceof ApiError ? error.message : COPY.genericError;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 py-10 text-red-700',
        className,
      )}
    >
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          重新載入
        </Button>
      )}
    </div>
  );
}
