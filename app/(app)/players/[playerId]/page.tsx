'use client';

import { useParams } from 'next/navigation';
import { usePlayer, usePlayerAnalysis, usePlayerRating } from '@/features/players/use-players';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { PlayerRatingCard } from '@/components/ai/PlayerRatingCard';
import { PlayerStatusCard } from '@/components/ai/PlayerStatusCard';
import { InjuryRiskBadge } from '@/components/ai/InjuryRiskBadge';
import { DeepChat } from '@/components/ai/DeepChat';
import { AbilityMeter } from '@/components/charts/AbilityMeter';
import { PlayerHexagonChart, type HexAxis } from '@/components/charts/PlayerHexagonChart';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { playerName, playerTierLabel, positionLabel, teamName } from '@/lib/formatters';

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const player = usePlayer(playerId);
  const rating = usePlayerRating(playerId);
  const analysis = usePlayerAnalysis(playerId);

  if (player.isLoading) return <LoadingState />;
  if (player.isError) return <ErrorState error={player.error} onRetry={() => player.refetch()} />;
  if (!player.data) return <ErrorState />;

  const p = player.data;

  // Shared by the radar and the numeric bars (進攻/創造/技術/防守/身體/狀態).
  const abilityAxes: HexAxis[] = [
    { label: '進攻', value: p.attackScore },
    { label: '創造', value: p.creativityScore },
    { label: '技術', value: p.techniqueScore },
    { label: '防守', value: p.defenseScore },
    { label: '身體', value: p.physicalScore },
    { label: '狀態', value: p.formScore },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{playerName(p)}</h1>
            <p className="text-sm text-slate-500">
              {p.team ? teamName(p.team) : '—'} · {positionLabel(p.position)}
              {p.clubName ? ` · ${p.clubName}` : ''}
              {p.shirtNumber != null ? ` · #${p.shirtNumber}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {p.overallScore != null && (
                <span className="text-sm text-slate-500">
                  總分 <span className="font-semibold text-slate-900">{p.overallScore}</span>
                </span>
              )}
              {p.ratingTier && p.ratingTier !== 'UNKNOWN' && (
                <Badge tone="brand">{playerTierLabel(p.ratingTier)}</Badge>
              )}
              <InjuryRiskBadge level={p.injuryRiskLevel} />
            </div>
            <FavoriteButton kind="player" id={p.id} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>六邊能力值</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="flex justify-center">
              <PlayerHexagonChart axes={abilityAxes} />
            </div>
            <div className="grid gap-4">
              {abilityAxes.map((axis) => (
                <AbilityMeter key={axis.label} label={axis.label} value={axis.value} />
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <PlayerRatingCard report={rating.data} isLoading={rating.isLoading} />

      {/* §5: /analysis may now return a PLAYER_STATUS_SUMMARY (status/injury) or the
          older PLAYER_HEXAGON_ANALYSIS — branch on reportType. */}
      {analysis.data?.reportType === 'PLAYER_STATUS_SUMMARY' ? (
        <PlayerStatusCard report={analysis.data} />
      ) : (
        <AiReportCard title="AI 球員分析" report={analysis.data} isLoading={analysis.isLoading} />
      )}

      <DeepChat endpoint={`/players/${p.id}/deep-chat`} context={playerName(p)} />
    </div>
  );
}
