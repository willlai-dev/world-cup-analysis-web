import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { ImpactDirection } from '@/types/api';

// News-impact direction → badge colour + label (Phase 3 §4):
// 正向綠 / 負向紅 / 中性灰 / 未知灰.
const DIRECTION_META: Record<ImpactDirection, { tone: BadgeTone; label: string }> = {
  POSITIVE: { tone: 'success', label: '正向' },
  NEGATIVE: { tone: 'danger', label: '負向' },
  NEUTRAL: { tone: 'neutral', label: '中性' },
  UNKNOWN: { tone: 'neutral', label: '未知' },
};

export function ImpactDirectionBadge({ direction }: { direction: ImpactDirection }) {
  const meta = DIRECTION_META[direction] ?? DIRECTION_META.UNKNOWN;
  return (
    <Badge tone={meta.tone} data-testid="impact-direction-badge">
      {meta.label}
    </Badge>
  );
}
