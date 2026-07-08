'use client';

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
import { LikelyScorelines } from '@/components/charts/LikelyScorelines';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { parseMatchAnalysis, predictionScorelines, structuredSource } from '@/lib/ai';
import { MATCH_STATUS_TONES } from '@/lib/constants';
import {
  formatDateTime,
  formatScore,
  matchEventLabel,
  matchStatusLabel,
  stageLabel,
  teamName,
} from '@/lib/formatters';
import type { MatchEvent } from '@/types/api';

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
            <Badge tone={MATCH_STATUS_TONES[m.status]}>{matchStatusLabel(m.status)}</Badge>
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
              {prediction.data.calibrated && prediction.data.calibrated.temperature != null && (
                <div>
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-xs font-medium text-slate-600">校正後機率</span>
                    <span className="text-[11px] text-slate-400">
                      依過去 {prediction.data.calibrated.sampleSize} 場賽前預測回測擬合（T=
                      {prediction.data.calibrated.temperature.toFixed(2)}）
                    </span>
                    {biasNote(prediction.data.calibrated) && (
                      <span className="text-[11px] text-slate-400">{biasNote(prediction.data.calibrated)}</span>
                    )}
                  </div>
                  <ScoreBar
                    segments={[
                      { label: '主勝', value: prediction.data.calibrated.homeWinProbability, colorClass: 'bg-brand-500' },
                      { label: '和局', value: prediction.data.calibrated.drawProbability, colorClass: 'bg-slate-400' },
                      { label: '客勝', value: prediction.data.calibrated.awayWinProbability, colorClass: 'bg-amber-500' },
                    ]}
                  />
                </div>
              )}
              {likelyScorelines.length > 0 && (
                <LikelyScorelines
                  items={likelyScorelines}
                  calibratedItems={prediction.data.calibrated?.scorelines ?? null}
                />
              )}
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
              {sortEvents(m.events).map((ev) => {
                const eventTeam =
                  ev.teamId === m.homeTeam.id
                    ? m.homeTeam
                    : ev.teamId === m.awayTeam.id
                      ? m.awayTeam
                      : null;
                return (
                  <li key={ev.id} className="flex items-baseline gap-3">
                    <span className="w-12 shrink-0 text-right font-mono text-slate-400">
                      {ev.minute != null ? `${ev.minute}${ev.extraMinute ? `+${ev.extraMinute}` : ''}'` : '—'}
                    </span>
                    {eventTeam && (
                      <span className="flex shrink-0 items-center gap-1.5 self-center">
                        <TeamFlag team={eventTeam} size={16} />
                        <span className="text-xs text-slate-500">{teamName(eventTeam)}</span>
                      </span>
                    )}
                    <span>
                      {matchEventLabel(ev.eventType)}
                      {ev.description ? ` — ${ev.description}` : ''}
                    </span>
                  </li>
                );
              })}
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
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {[m.homeTeam, m.awayTeam].map((team) => (
            <div key={team.id} className="flex items-center gap-2">
              <TeamFlag team={team} size={24} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 sm:flex-none">
                {teamName(team)}
              </span>
              <FavoriteButton kind="team" id={team.id} />
            </div>
          ))}
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

// Timeline order: earliest first; events without a minute go last.
function sortEvents(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort((a, b) => {
    if (a.minute == null || b.minute == null) {
      return (a.minute == null ? 1 : 0) - (b.minute == null ? 1 : 0);
    }
    return a.minute - b.minute || (a.extraMinute ?? 0) - (b.extraMinute ?? 0);
  });
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

// One-line summary of the per-team bias tilts applied by the calibration.
function biasNote(calibrated: {
  homeBiasAdjustment?: number | null;
  awayBiasAdjustment?: number | null;
}): string | null {
  const parts: string[] = [];
  const fmt = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`;
  if (calibrated.homeBiasAdjustment) parts.push(`主隊 ${fmt(calibrated.homeBiasAdjustment)}`);
  if (calibrated.awayBiasAdjustment) parts.push(`客隊 ${fmt(calibrated.awayBiasAdjustment)}`);
  return parts.length > 0 ? `含隊伍偏差調整：${parts.join(' / ')}` : null;
}
