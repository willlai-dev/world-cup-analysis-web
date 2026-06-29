import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiProviderBadge, AiUpdatedAt } from '@/components/ai/AiProviderBadge';
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

export function resolveAiState(
  report: AiReport | null | undefined,
  isLoading?: boolean,
): AiDisplayState {
  if (isLoading) return 'loading';
  if (!report) return 'idle';
  if (report.status === 'PENDING') return 'pending';
  if (report.status === 'FAILED') return 'failed';
  return 'done';
}

export function AiReportCard({ title = 'AI 分析', report, isLoading, state }: AiReportCardProps) {
  const displayState = state ?? resolveAiState(report, isLoading);

  return (
    <Card data-testid="ai-report-card" data-state={displayState}>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>{report?.title || title}</CardTitle>
        {displayState === 'done' && report && (
          <div className="flex items-center gap-2">
            <AiProviderBadge provider={report.provider} model={report.model} />
            <AiUpdatedAt value={report.updatedAt} />
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
    case 'done':
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {report?.content || COPY.insufficientData}
        </div>
      );
    case 'idle':
    default:
      return <p className="text-sm text-slate-400">{COPY.aiPending}</p>;
  }
}
