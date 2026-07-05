'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useMatch,
  useMatchAnalysis,
  useMatchAutoRefresh,
  useMatchPrediction,
  useMatchPostReport,
} from '@/features/matches/use-matches';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { DeepChat } from '@/components/ai/DeepChat';
import { ScoreBar } from '@/components/charts/ScoreBar';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { parseMatchAnalysis, predictionScorelines, structuredSource } from '@/lib/ai';
import { formatDateTime, formatScore, stageLabel, teamName } from '@/lib/formatters';
import type { LikelyScoreline } from '@/types/api';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const match = useMatch(matchId);
  const analysis = useMatchAnalysis(matchId);
  const prediction = useMatchPrediction(matchId);
  const postReport = useMatchPostReport(matchId);

  // Auto-refresh: triggers once on mount if match is LIVE or kickoff is imminent.
  // Schedules a single follow-up at nextRefreshAt while the match stays live.
  useMatchAutoRefresh(matchId, match.data?.status, match.data?.kickoffAt);

  if (match.isLoading) return <LoadingState />;
  if (match.isError) return <ErrorState error={match.error} onRetry={() => match.refetch()} />;
  if (!match.data) return <ErrorState />;

  const m = match.data;
  const analysisStructured = parseMatchAnalysis(structuredSource(analysis.data));
  const likelyScorelines = prediction.data ? predictionScorelines(prediction.data) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Scoreboard */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              {stageLabel(m.stage)}
              {m.groupName ? ` · ${m.groupName}` : ''}
            </span>
            <Badge tone="neutral">{m.status}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <TeamSide name={teamName(m.homeTeam)} team={m.homeTeam} />
            <div className="shrink-0 px-1 text-center sm:px-2">
              <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {formatScore(m.homeScore, m.awayScore)}
              </div>
              <div className="text-xs text-slate-400">{formatDateTime(m.kickoffAt)}</div>
              {m.stadium && <div className="text-xs text-slate-400">{m.stadium}</div>}
            </div>
            <TeamSide name={teamName(m.awayTeam)} team={m.awayTeam} align="right" />
          </div>
        </CardBody>
      </Card>

      {/* AI Match Analysis */}
      <AiReportCard
        title="AI 賽事分析"
        report={analysis.data}
        isLoading={analysis.isLoading}
      />

      {analysisStructured.keyPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>關鍵球員</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex flex-col gap-2 text-sm">
              {analysisStructured.keyPlayers.map((kp) => (
                <li key={kp.name} className="flex flex-col">
                  <span className="font-semibold text-slate-900">{kp.name}</span>
                  {kp.reason && <span className="text-slate-600">{kp.reason}</span>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Win Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>勝負傾向</CardTitle>
        </CardHeader>
        <CardBody>
          {prediction.isLoading ? (
            <LoadingState label="預測載入中…" />
          ) : prediction.data ? (
            <div className="flex flex-col gap-4">
              <ScoreBar
                segments={[
                  { label: '主勝', value: prediction.data.homeWinProbability, colorClass: 'bg-brand-500' },
                  { label: '和局', value: prediction.data.drawProbability, colorClass: 'bg-slate-400' },
                  { label: '客勝', value: prediction.data.awayWinProbability, colorClass: 'bg-amber-500' },
                ]}
              />
              {likelyScorelines.length > 0 && <LikelyScorelines items={likelyScorelines} />}
              {prediction.data.keyFactors.length > 0 && (
                <FactorList title="關鍵因素" items={prediction.data.keyFactors} />
              )}
              {prediction.data.riskNotes.length > 0 && (
                <FactorList title="風險因素" items={prediction.data.riskNotes} />
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">此分析尚未生成，請稍後再查看。</p>
          )}
        </CardBody>
      </Card>

      {/* Events Timeline */}
      {m.events && m.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>賽事事件</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex flex-col gap-2 text-sm text-slate-700">
              {m.events.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <span className="w-12 text-right font-mono text-slate-400">
                    {ev.minute != null ? `${ev.minute}${ev.extraMinute ? `+${ev.extraMinute}` : ''}'` : '—'}
                  </span>
                  <span>
                    {ev.eventType}
                    {ev.description ? ` — ${ev.description}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Post Match Review (finished matches) */}
      {m.status === 'FINISHED' && (
        <AiReportCard title="賽後回顧" report={postReport.data} isLoading={postReport.isLoading} />
      )}

      {/* Favorite team actions */}
      <Card>
        <CardHeader>
          <CardTitle>加入關注</CardTitle>
        </CardHeader>
        <CardBody className="flex gap-3">
          <FavoriteButton kind="team" id={m.homeTeam.id} />
          <FavoriteButton kind="team" id={m.awayTeam.id} />
        </CardBody>
      </Card>

      <DeepChat
        endpoint={`/matches/${m.id}/deep-chat`}
        context={`${teamName(m.homeTeam)} vs ${teamName(m.awayTeam)}`}
      />
    </div>
  );
}

function TeamSide({
  team,
  name,
  align = 'left',
}: {
  team: Parameters<typeof TeamFlag>[0]['team'];
  name: string;
  align?: 'left' | 'right';
}) {
  // Mobile: flag stacked above the name (centered); sm+: flag beside the name.
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 ${
        align === 'right' ? 'sm:flex-row-reverse sm:text-right' : 'sm:text-left'
      }`}
    >
      <TeamFlag team={team} size={40} />
      <span className="wrap-break-word text-sm font-semibold text-slate-900 sm:text-lg">{name}</span>
    </div>
  );
}

function FactorList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-slate-700">{title}</h4>
      <ul className="list-inside list-disc text-sm text-slate-600">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// 最可能比分 (§3): medal-ranked rows — rank + big score + animated bar + probability.
const SCORELINE_MEDALS = ['🥇', '🥈', '🥉'];
const SCORELINE_BAR_TONES = ['bg-brand-600', 'bg-brand-500', 'bg-brand-400'];
// Leader fills to this share of the track (never edge-to-edge); others scale down.
const SCORELINE_MAX_FILL = 80;

function LikelyScorelines({ items }: { items: LikelyScoreline[] }) {
  const top = items.slice(0, 3);
  const max = Math.max(...top.map((s) => s.probability), 1);

  // Grow the bars in from 0 on mount for a subtle reveal.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div data-testid="likely-scorelines">
      <h4 className="mb-2 text-sm font-semibold text-slate-700">最可能比分</h4>
      <ul className="flex flex-col gap-2.5">
        {top.map((s, i) => (
          <li key={s.score} className="flex items-center gap-3">
            <span className="w-6 text-center text-lg" aria-hidden>
              {SCORELINE_MEDALS[i] ?? `#${i + 1}`}
            </span>
            <span className="w-14 font-mono text-base font-bold tracking-wide text-slate-900">
              {s.score.replace('-', ' : ')}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  SCORELINE_BAR_TONES[i] ?? SCORELINE_BAR_TONES[2]
                }`}
                style={{
                  width: shown ? `${(s.probability / max) * SCORELINE_MAX_FILL}%` : '0%',
                  transitionDelay: `${i * 140}ms`,
                }}
              >
                {i === 0 && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/40 animate-[score-shine_2.6s_ease-in-out_infinite] motion-reduce:hidden" />
                )}
              </div>
            </div>
            <span className="w-12 text-right text-sm font-semibold text-slate-700">
              {Math.round(s.probability)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
