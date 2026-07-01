import { Badge } from '@/components/ui/Badge';
import { formatPercent } from '@/lib/formatters';

// AiReport.confidenceScore is 0–1 or 0–100 depending on the leg; formatPercent
// tolerates both. Renders nothing when the score is absent.
export function AiConfidenceBadge({ score }: { score?: number | null }) {
  if (score == null) return null;
  return (
    <Badge tone="neutral" data-testid="ai-confidence-badge">
      可信度 {formatPercent(score)}
    </Badge>
  );
}
