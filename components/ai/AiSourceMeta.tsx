import { AiProviderBadge } from '@/components/ai/AiProviderBadge';
import { formatDateTime } from '@/lib/formatters';
import { aiModeLabel } from '@/lib/ai';
import type { AiProvider } from '@/types/api';

export type AiSourceMetaProps = {
  provider: AiProvider;
  model?: string | null;
  // AiReport.updatedAt (when the report row was last written).
  updatedAt?: string | null;
  // Snapshot time of the underlying data the model reasoned over, when available.
  sourceUpdatedAt?: string | null;
  className?: string;
};

// provider · model + 更新時間 (+ 資料快照). Shared by AiReportCard and the chat panel
// so every AI surface labels its provenance the same way.
export function AiSourceMeta({
  provider,
  model,
  updatedAt,
  sourceUpdatedAt,
  className,
}: AiSourceMetaProps) {
  const mode = aiModeLabel(provider, model);
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className ?? ''}`}>
      <AiProviderBadge provider={provider} model={model} />
      {mode && (
        <span className="text-xs font-medium text-amber-600" data-testid="ai-mode-label">
          {mode}
        </span>
      )}
      {updatedAt && <span className="text-xs text-slate-400">更新於 {formatDateTime(updatedAt)}</span>}
      {sourceUpdatedAt && (
        <span className="text-xs text-slate-400">資料快照 {formatDateTime(sourceUpdatedAt)}</span>
      )}
    </div>
  );
}
