import { cn } from '@/lib/utils';

export type ChampionRankBarProps = {
  score: number; // 0-100
  className?: string;
};

export function ChampionRankBar({ score, className }: ChampionRankBarProps) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-slate-900">
        {Math.round(score)}
      </span>
    </div>
  );
}
