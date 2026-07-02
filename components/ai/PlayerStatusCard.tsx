import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { AiEstimateHint } from '@/components/ai/AiEstimateHint';
import { InjuryRiskBadge } from '@/components/ai/InjuryRiskBadge';
import { AbilityMeter } from '@/components/charts/AbilityMeter';
import { resolveAiState } from '@/components/ai/AiReportCard';
import { parsePlayerStatusSummary, structuredSource } from '@/lib/ai';
import { COPY } from '@/lib/constants';
import { formatDateTime } from '@/lib/formatters';
import type { AiReport } from '@/types/api';

// Phase 3 §5: PLAYER_STATUS_SUMMARY report — recent form / injury outlook for the
// top players of teams still in the tournament. Cautious inference tone: carries
// a「推論 / 僅供參考」note plus the data time. Distinct from the hexagon rating;
// the player page branches on report.reportType to pick this vs AiReportCard.
export function PlayerStatusCard({ report }: { report?: AiReport | null }) {
  const state = resolveAiState(report);
  const s = parsePlayerStatusSummary(structuredSource(report));

  return (
    <Card data-testid="player-status-card" data-state={state}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>AI 狀態 / 傷病摘要</CardTitle>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <InjuryRiskBadge level={s.injuryRiskLevel} />
          {state === 'done' && report && (
            <AiSourceMeta
              provider={report.provider}
              model={report.model}
              updatedAt={report.updatedAt}
            />
          )}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {state === 'pending' ? (
          <p className="text-sm text-slate-500">AI 分析產生中…</p>
        ) : state === 'failed' ? (
          <p className="text-sm text-red-600">{COPY.aiFailed}</p>
        ) : state === 'insufficient_data' ? (
          <p className="text-sm text-amber-700">{COPY.insufficientData}</p>
        ) : (
          <>
            <p className="text-xs text-amber-600">AI 推論，僅供參考</p>
            {s.statusSummaryZh && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {s.statusSummaryZh}
              </p>
            )}
            {s.formScore != null && <AbilityMeter label="近期狀態" value={s.formScore} />}
            <AiEstimateHint dataLimitations={s.dataLimitations} />
            {report && (
              <p className="text-xs text-slate-400">資料更新時間 {formatDateTime(report.createdAt)}</p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
