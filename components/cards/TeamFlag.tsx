
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { fifaCodeToFlagUrl } from '@/lib/flags';
import type { TeamSummary } from '@/types/api';

/**
 * Extract a potential FIFA code from a bare flagUrl like "bra.svg" → "BRA".
 * Returns null if the URL doesn't match the expected pattern.
 */
function codeFromFlagUrl(flagUrl: string): string | null {
  const match = flagUrl.match(/(?:^|[/\\])([a-zA-Z]{2,4})\.(?:svg|png|jpg|webp)$/i);
  return match ? match[1].toUpperCase() : null;
}

export function TeamFlag({
  team,
  size = 24,
  className,
}: {
  team: Pick<TeamSummary, 'flagUrl' | 'nameEn' | 'fifaCode'>;
  size?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  // Resolve a FIFA/country code from fifaCode first, then try to extract it
  // from the bare flagUrl filename (e.g. "bra.svg" → "BRA").
  const code =
    team.fifaCode ??
    (team.flagUrl ? codeFromFlagUrl(team.flagUrl) : null);

  const src = !imgError && code ? fifaCodeToFlagUrl(code) : null;

  if (src) {
    return (
      <img
        src={src}
        alt={`${team.nameEn} flag`}
        width={size}
        height={size}
        onError={() => setImgError(true)}
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
      {code?.slice(0, 3) ?? team.nameEn.slice(0, 3).toUpperCase()}
    </span>
  );
}
