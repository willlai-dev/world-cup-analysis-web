import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { AiConfidenceBadge } from '@/components/ai/AiConfidenceBadge';
import { StructuredReport } from '@/components/ai/StructuredReport';
import { plainProse, structuredSource } from '@/lib/ai';
import { COPY } from '@/lib/constants';
import type { AiReport } from '@/types/api';

export type AiDisplayState =
  | 'idle'
  | 'loading'
  | 'pending'
  | 'done'
  | 'failed'
  | 'insufficient_data';

export type AiReportCardProps = {
  title?: string;
  report?: AiReport | null;
  isLoading?: boolean;
  // Optional explicit override; otherwise derived from report/isLoading.
  state?: AiDisplayState;
};

function hasStructuredJson(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
}

export function resolveAiState(
  report: AiReport | null | undefined,
  isLoading?: boolean,
): AiDisplayState {
  if (isLoading) return 'loading';
  if (!report) return 'idle';
  if (report.status === 'PENDING') return 'pending';
  if (report.status === 'FAILED') return 'failed';
  // DONE but the model produced no usable content → "資料不足".
  if (!report.content?.trim() && !hasStructuredJson(report.structuredJson)) {
    return 'insufficient_data';
  }
  return 'done';
}

export function AiReportCard({ title = 'AI 分析', report, isLoading, state }: AiReportCardProps) {
  const displayState = state ?? resolveAiState(report, isLoading);

  return (
    <Card data-testid="ai-report-card" data-state={displayState}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{report?.title || title}</CardTitle>
        {displayState === 'done' && report && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AiConfidenceBadge score={report.confidenceScore} />
            <AiSourceMeta
              provider={report.provider}
              model={report.model}
              updatedAt={report.updatedAt}
              sourceUpdatedAt={undefined}
            />
          </div>
        )}
      </CardHeader>
      <CardBody>
        <AiReportBody state={displayState} report={report} />
      </CardBody>
    </Card>
  );
}

function AiReportBody({
  state,
  report,
}: {
  state: AiDisplayState;
  report?: AiReport | null;
}) {
  switch (state) {
    case 'loading':
      return <div className="h-16 animate-pulse rounded bg-slate-100" aria-label="載入中" />;
    case 'pending':
      return <p className="text-sm text-slate-500">AI 分析產生中…</p>;
    case 'failed':
      return <p className="text-sm text-red-600">{COPY.aiFailed}</p>;
    case 'insufficient_data':
      return <p className="text-sm text-amber-700">{COPY.insufficientData}</p>;
    case 'done': {
      // Never dump raw JSON: show real prose, else a readable structured view.
      const prose = plainProse(report?.content);
      if (prose) {
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{prose}</div>
        );
      }
      const src = structuredSource(report);
      if (src && typeof src === 'object') return <StructuredReport data={src} />;
      return <p className="text-sm text-amber-700">{COPY.insufficientData}</p>;
    }
    case 'idle':
    default:
      return <p className="text-sm text-slate-400">{COPY.aiPending}</p>;
  }
}
