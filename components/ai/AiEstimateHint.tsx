import { hasEstimate } from '@/lib/ai';

// Faint "AI 推估" hint shown when the model flagged limited data (§6). Lists the
// limitations as the title (tooltip) so the main copy stays compact.
export function AiEstimateHint({ dataLimitations }: { dataLimitations?: string[] | null }) {
  if (!hasEstimate(dataLimitations)) return null;
  return (
    <p
      data-testid="ai-estimate-hint"
      className="text-xs text-amber-600"
      title={(dataLimitations ?? []).join('\n')}
    >
      ⚠ AI 推估（資料有限）
    </p>
  );
}
