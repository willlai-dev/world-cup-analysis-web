import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { AiConfidenceBadge } from '@/components/ai/AiConfidenceBadge';
import { AiEstimateHint } from '@/components/ai/AiEstimateHint';
import { resolveAiState } from '@/components/ai/AiReportCard';
import { parsePlayerRating, plainProse, structuredSource } from '@/lib/ai';
import { COPY } from '@/lib/constants';
import { playerTierLabel } from '@/lib/formatters';
import type { AiReport } from '@/types/api';

// Structured visualization of GET /players/:id/rating (§2 文字詳析): role summary,
// strengths/weaknesses and data-limitation hint. Falls back to plain content when
// the report has no structuredJson.
export function PlayerRatingCard({
  report,
  isLoading,
}: {
  report?: AiReport | null;
  isLoading?: boolean;
}) {
  const state = resolveAiState(report, isLoading);
  const s = parsePlayerRating(structuredSource(report));
  const hasStructured =
    s.strengths.length > 0 || s.weaknesses.length > 0 || !!s.roleSummary || s.overallScore != null;

  return (
    <Card data-testid="player-rating-card" data-state={state}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>AI 球員評級</CardTitle>
        {state === 'done' && report && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AiConfidenceBadge score={report.confidenceScore} />
            <AiSourceMeta provider={report.provider} model={report.model} updatedAt={report.updatedAt} />
          </div>
        )}
      </CardHeader>
      <CardBody>
        {state === 'loading' ? (
          <div className="h-16 animate-pulse rounded bg-slate-100" aria-label="載入中" />
        ) : state === 'pending' ? (
          <p className="text-sm text-slate-500">AI 分析產生中…</p>
        ) : state === 'failed' ? (
          <p className="text-sm text-red-600">{COPY.aiFailed}</p>
        ) : state === 'idle' ? (
          <p className="text-sm text-slate-400">{COPY.aiPending}</p>
        ) : state === 'insufficient_data' ? (
          <p className="text-sm text-amber-700">{COPY.insufficientData}</p>
        ) : hasStructured ? (
          <div className="flex flex-col gap-4">
            {(s.overallScore != null || s.ratingTier) && (
              <p className="text-sm text-slate-600">
                總評{' '}
                <span className="font-semibold text-slate-900">{s.overallScore ?? '—'}</span>
                {s.ratingTier && s.ratingTier !== 'UNKNOWN' && (
                  <span className="ml-2 text-slate-500">{playerTierLabel(s.ratingTier)}</span>
                )}
              </p>
            )}
            {s.roleSummary && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {s.roleSummary}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {s.strengths.length > 0 && <FactorList title="優勢" tone="green" items={s.strengths} />}
              {s.weaknesses.length > 0 && <FactorList title="弱點" tone="amber" items={s.weaknesses} />}
            </div>
            <AiEstimateHint dataLimitations={s.dataLimitations} />
          </div>
        ) : plainProse(report?.content) ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {plainProse(report?.content)}
          </div>
        ) : (
          <p className="text-sm text-amber-700">{COPY.insufficientData}</p>
        )}
      </CardBody>
    </Card>
  );
}

function FactorList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'green' | 'amber';
}) {
  const dot = tone === 'green' ? 'text-green-600' : 'text-amber-600';
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-slate-700">{title}</h4>
      <ul className="flex flex-col gap-1 text-sm text-slate-600">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={dot} aria-hidden>
              ●
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
