import { cn } from '@/lib/utils';

// Lightweight responsive container for filter controls above a list.
export function FilterBar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
