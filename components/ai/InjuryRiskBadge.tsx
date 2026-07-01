import { Badge } from '@/components/ui/Badge';
import { riskLabel } from '@/lib/formatters';
import type { RiskLevel } from '@/types/api';

// Injury-risk light: LOW→green, MEDIUM→amber, HIGH→red, UNKNOWN→gray (§2).
const RISK_TONES: Record<RiskLevel, 'success' | 'warning' | 'danger' | 'neutral'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  UNKNOWN: 'neutral',
};

export function InjuryRiskBadge({
  level,
  showLabel = true,
}: {
  level?: RiskLevel | null;
  showLabel?: boolean;
}) {
  if (!level) return null;
  return (
    <Badge tone={RISK_TONES[level] ?? 'neutral'} data-testid="injury-risk-badge">
      {showLabel ? '傷病風險 ' : ''}
      {riskLabel(level)}
    </Badge>
  );
}
