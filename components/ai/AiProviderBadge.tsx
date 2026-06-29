import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatters';
import type { AiProvider } from '@/types/api';

const PROVIDER_LABELS: Record<AiProvider, string> = {
  NVIDIA: 'NVIDIA',
  QWEN: 'Qwen',
  PROGRAM_RULE: '規則引擎',
};

export function AiProviderBadge({
  provider,
  model,
}: {
  provider: AiProvider;
  model?: string | null;
}) {
  return (
    <Badge tone="brand">
      {PROVIDER_LABELS[provider] ?? provider}
      {model ? ` · ${model}` : ''}
    </Badge>
  );
}

export function AiUpdatedAt({ value }: { value?: string | null }) {
  if (!value) return null;
  return <span className="text-xs text-slate-400">更新於 {formatDateTime(value)}</span>;
}
