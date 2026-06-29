/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import type { TeamSummary } from '@/types/api';

export function TeamFlag({
  team,
  size = 24,
  className,
}: {
  team: Pick<TeamSummary, 'flagUrl' | 'nameEn' | 'fifaCode'>;
  size?: number;
  className?: string;
}) {
  if (team.flagUrl) {
    return (
      <img
        src={team.flagUrl}
        alt={`${team.nameEn} flag`}
        width={size}
        height={size}
        className={cn('inline-block rounded-sm object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-sm bg-slate-200 text-[10px] font-semibold text-slate-600',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {team.fifaCode ?? team.nameEn.slice(0, 3).toUpperCase()}
    </span>
  );
}
