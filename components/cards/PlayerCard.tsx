import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { InjuryRiskBadge } from '@/components/ai/InjuryRiskBadge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { routes } from '@/lib/routes';
import { playerName, playerTierLabel, positionLabel, teamName } from '@/lib/formatters';
import type { PlayerSummary } from '@/types/api';

export function PlayerCard({ player }: { player: PlayerSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <Link href={routes.player(player.id)}>
            <p className="font-semibold text-slate-900">{playerName(player)}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              {player.team && (
                <TeamFlag team={player.team} size={16} className="shrink-0" />
              )}
              {player.team ? teamName(player.team) : '—'} · {positionLabel(player.position)}
            </p>
          </Link>
          <div className="flex flex-col items-end gap-1">
            {player.ratingTier && player.ratingTier !== 'UNKNOWN' && (
              <Badge tone="brand">{playerTierLabel(player.ratingTier)}</Badge>
            )}
            <InjuryRiskBadge level={player.injuryRiskLevel} showLabel={false} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <dt>俱樂部</dt>
            <dd className="truncate font-medium text-slate-800">{player.clubName ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt>總分</dt>
            <dd className="font-medium text-slate-800">{player.overallScore ?? '—'}</dd>
          </div>
          {/* §5: injuryRiskLevel/formScore are written back onto PlayerSummary; the
              risk badge sits in the header, so show近期狀態 (formScore) here. */}
          <div className="flex justify-between">
            <dt>近期狀態</dt>
            <dd className="font-medium text-slate-800">{player.formScore ?? '—'}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between">
          <Link href={routes.player(player.id)} className="text-sm font-medium text-brand-700 hover:underline">
            查看詳情 →
          </Link>
          <FavoriteButton kind="player" id={player.id} />
        </div>
      </CardBody>
    </Card>
  );
}
