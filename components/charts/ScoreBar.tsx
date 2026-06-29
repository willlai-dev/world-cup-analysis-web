import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/formatters';

export type ScoreBarSegment = {
  label: string;
  value?: number | null; // probability 0-1 or 0-100
  colorClass: string;
};

// Horizontal stacked bar for win/draw/loss prediction probabilities.
export function ScoreBar({ segments, className }: { segments: ScoreBarSegment[]; className?: string }) {
  const normalized = segments.map((s) => {
    const v = s.value == null ? 0 : s.value <= 1 ? s.value * 100 : s.value;
    return { ...s, pct: Math.max(0, v) };
  });
  const total = normalized.reduce((sum, s) => sum + s.pct, 0) || 1;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
        {normalized.map((s) => (
          <div
            key={s.label}
            className={cn('h-full', s.colorClass)}
            style={{ width: `${(s.pct / total) * 100}%` }}
            title={`${s.label} ${formatPercent(s.value)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        {normalized.map((s) => (
          <span key={s.label}>
            {s.label} {formatPercent(s.value)}
          </span>
        ))}
      </div>
    </div>
  );
}
