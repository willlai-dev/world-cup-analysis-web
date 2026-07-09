'use client';

import { useEffect, useState } from 'react';
import type { LikelyScoreline } from '@/types/api';

// 最可能比分 (§3): medal-ranked rows — rank + big score + animated bar + probability.
const SCORELINE_MEDALS = ['🥇', '🥈', '🥉'];
const SCORELINE_BAR_TONES = ['bg-brand-600', 'bg-brand-500', 'bg-brand-400'];
// Leader fills to this share of the track (never edge-to-edge); others scale down.
const SCORELINE_MAX_FILL = 80;

export function LikelyScorelines({
  items,
  calibratedItems = null,
}: {
  items: LikelyScoreline[];
  calibratedItems?: LikelyScoreline[] | null;
}) {
  // When calibrated scorelines exist (paired by score string), they drive the
  // displayed probability, bar width and ranking; the raw AI number stays
  // visible as secondary context.
  const calibratedByScore = new Map(
    (calibratedItems ?? []).map((s) => [s.score, s.probability]),
  );
  const top = items
    .slice(0, 3)
    .map((s) => ({
      score: s.score,
      probability: calibratedByScore.get(s.score) ?? s.probability,
      rawProbability: calibratedByScore.has(s.score) ? s.probability : null,
    }))
    .sort((a, b) => b.probability - a.probability);
  const max = Math.max(...top.map((s) => s.probability), 1);
  const hasCalibrated = top.some((s) => s.rawProbability !== null);

  // Grow the bars in from 0 on mount for a subtle reveal.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div data-testid="likely-scorelines">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
        <h4 className="text-sm font-semibold text-slate-700">最可能比分</h4>
        {hasCalibrated && (
          <span className="text-[11px] text-slate-400">已依校正後勝負機率調整；淡色為 AI 原始值</span>
        )}
      </div>
      <ul className="flex flex-col gap-2.5">
        {top.map((s, i) => (
          <li key={s.score} className="flex items-center gap-3">
            <span className="w-6 text-center text-lg" aria-hidden>
              {SCORELINE_MEDALS[i] ?? `#${i + 1}`}
            </span>
            <span className="w-14 font-mono text-base font-bold tracking-wide text-slate-900">
              {s.score.replace('-', ' : ')}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  SCORELINE_BAR_TONES[i] ?? SCORELINE_BAR_TONES[2]
                }`}
                style={{
                  width: shown ? `${(s.probability / max) * SCORELINE_MAX_FILL}%` : '0%',
                  transitionDelay: `${i * 140}ms`,
                }}
              >
                {i === 0 && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/40 animate-[score-shine_2.6s_ease-in-out_infinite] motion-reduce:hidden" />
                )}
              </div>
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-slate-700">
              {Math.round(s.probability)}%
            </span>
            {hasCalibrated && (
              <span className="w-14 shrink-0 text-right text-xs text-slate-400">
                {s.rawProbability !== null ? `原 ${Math.round(s.rawProbability)}%` : ''}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
