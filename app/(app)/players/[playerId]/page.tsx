'use client';

import { useParams } from 'next/navigation';
import { usePlayer } from '@/features/players/use-players';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { NewsCard } from '@/components/cards/NewsCard';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { DeepChatPlaceholder } from '@/components/ai/DeepChatPlaceholder';
import { AbilityMeter } from '@/components/charts/AbilityMeter';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { playerName, positionLabel, teamName } from '@/lib/formatters';

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const player = usePlayer(playerId);

  if (player.isLoading) return <LoadingState />;
  if (player.isError) return <ErrorState error={player.error} onRetry={() => player.refetch()} />;
  if (!player.data) return <ErrorState />;

  const p = player.data;

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
            {p.ratingTier && p.ratingTier !== 'UNKNOWN' && (
              <Badge tone="brand">{p.ratingTier.replace('_PLUS', '+')}</Badge>
            )}
            <FavoriteButton kind="player" id={p.id} />
          </div>
        </CardBody>
      </Card>

      {/* Hexagon ability chart is deferred to Phase 2 — Phase 1 shows the raw values. */}
      <Card>
        <CardHeader>
          <CardTitle>六邊能力值</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-xs text-slate-400">六邊形圖表將於 Phase 2 提供，目前以數值呈現。</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AbilityMeter label="進攻" value={p.attackScore} />
            <AbilityMeter label="創造" value={p.creativityScore} />
            <AbilityMeter label="技術" value={p.techniqueScore} />
            <AbilityMeter label="防守" value={p.defenseScore} />
            <AbilityMeter label="身體" value={p.physicalScore} />
            <AbilityMeter label="狀態" value={p.formScore} />
          </div>
        </CardBody>
      </Card>

      <AiReportCard title="AI 球員分析" report={p.analysis} />

      {p.relatedNews && p.relatedNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>相關新聞</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {p.relatedNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </CardBody>
        </Card>
      )}

      <DeepChatPlaceholder context={playerName(p)} />
    </div>
  );
}
