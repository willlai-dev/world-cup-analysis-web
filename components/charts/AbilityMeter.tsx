import { cn } from '@/lib/utils';

export type AbilityMeterProps = {
  label: string;
  value?: number | null; // 0-100
  max?: number;
  className?: string;
};

// Simple CSS bar — no third-party chart package (per spec).
export function AbilityMeter({ label, value, max = 100, className }: AbilityMeterProps) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value ?? '—'}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
