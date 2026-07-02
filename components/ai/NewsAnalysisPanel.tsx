import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiConfidenceBadge } from '@/components/ai/AiConfidenceBadge';
import { AiEstimateHint } from '@/components/ai/AiEstimateHint';
import { ImpactDirectionBadge } from '@/components/ai/ImpactDirectionBadge';
import { parseNewsAnalysis, structuredSource } from '@/lib/ai';
import { formatDateTime } from '@/lib/formatters';
import type { AiReport, NewsImpactEntity } from '@/types/api';

// Phase 3 §4: news impact analysis. Hidden entirely until a DONE report exists
// (the endpoint returns null before the daily job runs). Tone is cautious
// inference — every impact is labelled 推論 and the card carries a「僅供參考」note.
export function NewsAnalysisPanel({
  report,
  isLoading,
}: {
  report?: AiReport | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI 影響分析</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="h-16 animate-pulse rounded bg-slate-100" aria-label="載入中" />
        </CardBody>
      </Card>
    );
  }

  // No report yet, or not a successful one → hide the section (not an error).
  if (!report || report.status !== 'DONE') return null;

  const s = parseNewsAnalysis(structuredSource(report));
  const hasContent =
    !!s.impactSummaryZh || s.affectedTeams.length > 0 || s.affectedPlayers.length > 0;
  if (!hasContent) return null;

  const confidence = s.confidenceScore ?? report.confidenceScore;

  return (
    <Card data-testid="news-analysis-panel">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>AI 影響分析</CardTitle>
        <AiConfidenceBadge score={confidence} />
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="text-xs text-amber-600">AI 推論，僅供參考</p>

        {s.impactSummaryZh && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {s.impactSummaryZh}
          </p>
        )}

        {s.affectedTeams.length > 0 && (
          <ImpactGroup title="受影響球隊" entities={s.affectedTeams} />
        )}
        {s.affectedPlayers.length > 0 && (
          <ImpactGroup title="受影響球員" entities={s.affectedPlayers} />
        )}

        <AiEstimateHint dataLimitations={s.dataLimitations} />

        <p className="text-xs text-slate-400">資料更新時間 {formatDateTime(report.createdAt)}</p>
      </CardBody>
    </Card>
  );
}

function ImpactGroup({ title, entities }: { title: string; entities: NewsImpactEntity[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-slate-500">{title}</h4>
      <ul className="flex flex-col gap-2">
        {entities.map((entity, i) => (
          <li key={`${entity.name}-${i}`} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{entity.name}</span>
              <ImpactDirectionBadge direction={entity.direction} />
            </div>
            {entity.impact && <p className="text-sm text-slate-600">{entity.impact}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
