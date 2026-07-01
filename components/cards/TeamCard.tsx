import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { teamName, teamTierLabel } from '@/lib/formatters';
import type { TeamSummary } from '@/types/api';

export function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', team.isEliminated && 'opacity-75')}>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <Link href={routes.team(team.id)} className="flex items-center gap-3">
            <TeamFlag team={team} size={36} />
            <div>
              <p className="font-semibold text-slate-900">{teamName(team)}</p>
              <p className="text-xs text-slate-500">
                {team.continent ?? '—'}
                {team.groupName ? ` · ${team.groupName}` : ''}
              </p>
            </div>
          </Link>
          <div className="flex flex-col items-end gap-1">
            <Badge tone="brand">{teamTierLabel(team.ratingTier)}</Badge>
            {team.isEliminated && <Badge tone="neutral">已淘汰</Badge>}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <dt>教練</dt>
            <dd className="font-medium text-slate-800">{team.coachName ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt>冠軍指數</dt>
            <dd className="font-medium text-slate-800">{team.championScore ?? '—'}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between">
          <Link href={routes.team(team.id)} className="text-sm font-medium text-brand-700 hover:underline">
            查看詳情 →
          </Link>
          <FavoriteButton kind="team" id={team.id} />
        </div>
      </CardBody>
    </Card>
  );
}
