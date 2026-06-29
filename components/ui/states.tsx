import { ApiError } from '@/lib/api-client';
import { COPY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

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
