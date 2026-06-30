'use client';

import { useParams } from 'next/navigation';
import { useTeam, useTeamAnalysis, useTeamPlayers, useTeamMatches } from '@/features/teams/use-teams';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { MatchCard } from '@/components/cards/MatchCard';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { DeepChatPlaceholder } from '@/components/ai/DeepChatPlaceholder';
import { AbilityMeter } from '@/components/charts/AbilityMeter';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { teamName, teamTierLabel } from '@/lib/formatters';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = useTeam(teamId);
  const analysis = useTeamAnalysis(teamId);
  const players = useTeamPlayers(teamId);
  const matches = useTeamMatches(teamId);

  if (team.isLoading) return <LoadingState />;
  if (team.isError) return <ErrorState error={team.error} onRetry={() => team.refetch()} />;
  if (!team.data) return <ErrorState />;

  const t = team.data;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TeamFlag team={t} size={56} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{teamName(t)}</h1>
              <p className="text-sm text-slate-500">
                {t.continent ?? '—'}
                {t.groupName ? ` · ${t.groupName}` : ''}
                {t.coachName ? ` · 教練 ${t.coachName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone="brand">{teamTierLabel(t.ratingTier)}</Badge>
            <FavoriteButton kind="team" id={t.id} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>能力分析</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <AbilityMeter label="進攻" value={t.attackScore} />
          <AbilityMeter label="中場" value={t.midfieldScore} />
          <AbilityMeter label="防守" value={t.defenseScore} />
          <AbilityMeter label="狀態" value={t.statusScore ?? t.formScore} />
          <AbilityMeter label="冠軍指數" value={t.championScore} />
        </CardBody>
      </Card>

      <AiReportCard title="AI 國家隊分析" report={analysis.data} isLoading={analysis.isLoading} />

      <Card>
        <CardHeader>
          <CardTitle>近期賽事</CardTitle>
        </CardHeader>
        <CardBody>
          {matches.isLoading ? (
            <LoadingState />
          ) : matches.data && matches.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {matches.data.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>球員名單</CardTitle>
        </CardHeader>
        <CardBody>
          {players.isLoading ? (
            <LoadingState />
          ) : players.data && players.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.data.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardBody>
      </Card>

      <DeepChatPlaceholder context={teamName(t)} />
    </div>
  );
}
