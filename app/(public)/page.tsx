'use client';

import Link from 'next/link';
import { useHomeHighlights } from '@/features/home/use-home';
import { useAuth } from '@/features/auth/use-auth';
import { routes } from '@/lib/routes';
import { Button } from '@/components/ui/Button';
import { MatchCard } from '@/components/cards/MatchCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { ChampionEntryCard } from '@/components/cards/ChampionEntryCard';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { teamName, playerName, positionLabel } from '@/lib/formatters';

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
          <HomeSection title="熱門賽事">
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

          <HomeSection title="冠軍預測摘要">
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

          <HomeSection title="焦點國家隊">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.featuredTeams.map((team) => (
                <Card key={team.id}>
                  <CardBody className="flex items-center gap-3">
                    <TeamFlag team={team} size={32} />
                    <div>
                      <p className="font-medium text-slate-900">{teamName(team)}</p>
                      <p className="text-xs text-slate-500">{team.continent ?? '—'}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </HomeSection>

          <HomeSection title="焦點球員">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.featuredPlayers.map((player) => (
                <Card key={player.id}>
                  <CardBody>
                    <p className="font-medium text-slate-900">{playerName(player)}</p>
                    <p className="text-xs text-slate-500">
                      {player.team ? teamName(player.team) : '—'} · {positionLabel(player.position)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </HomeSection>

          <HomeSection title="新聞亮點">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.newsHighlights.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </HomeSection>
        </div>
      )}
    </div>
  );
}

function HomeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
