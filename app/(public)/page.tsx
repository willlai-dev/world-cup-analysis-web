'use client';

import Link from 'next/link';
import { useHomeHighlights } from '@/features/home/use-home';
import { useAuth } from '@/features/auth/use-auth';
import { routes } from '@/lib/routes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MatchCard } from '@/components/cards/MatchCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { ChampionEntryCard } from '@/components/cards/ChampionEntryCard';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import {
  teamName,
  teamTierLabel,
  playerName,
  playerTierLabel,
  positionLabel,
} from '@/lib/formatters';
import type { PlayerSummary, TeamSummary } from '@/types/api';

export default function HomePage() {
  const { isGuest } = useAuth();
  const { data, isLoading, isError, error, refetch } = useHomeHighlights();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-10 text-white sm:px-8 sm:py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">AI World Cup Analyst</h1>
        <p className="mt-3 max-w-2xl text-brand-50">
          以 AI 分析為核心的世足網站：賽前分析、賽後回顧、國家隊評級、球員六邊能力、冠軍預測與英文新聞摘要。
        </p>
        {isGuest && (
          <div className="mt-6 flex gap-3">
            <Link href={routes.login}>
              <Button variant="secondary">登入</Button>
            </Link>
            {/* Styled directly (not via Button): cn() doesn't merge conflicting
                Tailwind utilities, so variant bg/text overrides are order-dependent. */}
            <Link
              href={routes.register}
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              註冊
            </Link>
          </div>
        )}
      </section>

      {isLoading && <LoadingState />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-10">
          <HomeSection
            title="熱門賽事"
            subtitle="最近完賽的比賽結果，不足時補上即將開打的賽事"
            moreHref={routes.matches}
          >
            {data.featuredMatches.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.featuredMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection
            title="冠軍預測摘要"
            subtitle="最新一次 AI 冠軍預測的前五名"
            moreHref={routes.championPredictions}
          >
            {data.championSummary.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3">
                {data.championSummary.slice(0, 5).map((entry) => (
                  <ChampionEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection
            title="焦點國家隊"
            subtitle="仍在賽的球隊中冠軍指數最高的幾支"
            moreHref={routes.teams}
          >
            {data.featuredTeams.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.featuredTeams.map((team) => (
                  <HomeTeamCard key={team.id} team={team} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection
            title="焦點球員"
            subtitle="綜合評分最高的球員"
            moreHref={routes.players}
          >
            {data.featuredPlayers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.featuredPlayers.map((player) => (
                  <HomePlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title="新聞亮點" subtitle="最新的世足相關新聞" moreHref={routes.news}>
            {data.newsHighlights.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.newsHighlights.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            )}
          </HomeSection>
        </div>
      )}
    </div>
  );
}

function HomeSection({
  title,
  subtitle,
  moreHref,
  children,
}: {
  title: string;
  subtitle?: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="shrink-0 text-sm font-medium text-brand-700 hover:underline"
          >
            查看全部 →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// Compact clickable team card for home. Deliberately not TeamCard: home is a
// public page and TeamCard carries FavoriteButton (auth-only mutation).
function HomeTeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link href={routes.team(team.id)} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <TeamFlag team={team} size={32} />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{teamName(team)}</p>
              <p className="text-xs text-slate-500">
                {team.continent ?? '—'}
                {team.groupName ? ` · ${team.groupName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <Badge tone="brand">{teamTierLabel(team.ratingTier)}</Badge>
            <span>
              冠軍指數 <span className="font-medium text-slate-800">{team.championScore ?? '—'}</span>
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

// Compact clickable player card for home (no FavoriteButton — see HomeTeamCard).
function HomePlayerCard({ player }: { player: PlayerSummary }) {
  return (
    <Link href={routes.player(player.id)} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{playerName(player)}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                {player.team && <TeamFlag team={player.team} size={16} className="shrink-0" />}
                <span className="truncate">
                  {player.team ? teamName(player.team) : '—'} · {positionLabel(player.position)}
                </span>
              </p>
            </div>
            {player.ratingTier && player.ratingTier !== 'UNKNOWN' && (
              <Badge tone="brand" className="shrink-0">
                {playerTierLabel(player.ratingTier)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600">
            綜合評分 <span className="font-medium text-slate-800">{player.overallScore ?? '—'}</span>
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
