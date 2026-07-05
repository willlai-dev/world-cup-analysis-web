import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { routes } from '@/lib/routes';
import { MATCH_STATUS_TONES } from '@/lib/constants';
import { formatDateTime, formatScore, matchStatusLabel, stageLabel, teamName } from '@/lib/formatters';
import type { MatchSummary } from '@/types/api';

export function MatchCard({ match }: { match: MatchSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {stageLabel(match.stage)}
            {match.groupName ? ` · ${match.groupName}` : ''}
          </span>
          <Badge tone={MATCH_STATUS_TONES[match.status]}>{matchStatusLabel(match.status)}</Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <TeamSide team={match.homeTeam} />
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {formatScore(match.homeScore, match.awayScore)}
            </div>
            <div className="text-[11px] text-slate-400">{formatDateTime(match.kickoffAt)}</div>
          </div>
          <TeamSide team={match.awayTeam} align="right" />
        </div>

        {match.aiSummary && (
          <p className="line-clamp-2 text-xs text-slate-500">{match.aiSummary}</p>
        )}

        <Link
          href={routes.match(match.id)}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          查看詳情 →
        </Link>
      </CardBody>
    </Card>
  );
}

function TeamSide({
  team,
  align = 'left',
}: {
  team: MatchSummary['homeTeam'];
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
    >
      <TeamFlag team={team} size={28} />
      <span className="truncate text-sm font-medium text-slate-800">{teamName(team)}</span>
    </div>
  );
}
