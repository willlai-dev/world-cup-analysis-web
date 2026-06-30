'use client';

import { useParams } from 'next/navigation';
import {
  useMatch,
  useMatchAnalysis,
  useMatchPrediction,
  useMatchPostReport,
} from '@/features/matches/use-matches';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { FavoriteButton } from '@/components/cards/FavoriteButton';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { DeepChatPlaceholder } from '@/components/ai/DeepChatPlaceholder';
import { ScoreBar } from '@/components/charts/ScoreBar';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { formatDateTime, formatScore, stageLabel, teamName } from '@/lib/formatters';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const match = useMatch(matchId);
  const analysis = useMatchAnalysis(matchId);
  const prediction = useMatchPrediction(matchId);
  const postReport = useMatchPostReport(matchId);

  if (match.isLoading) return <LoadingState />;
  if (match.isError) return <ErrorState error={match.error} onRetry={() => match.refetch()} />;
  if (!match.data) return <ErrorState />;

  const m = match.data;

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
          <div className="flex items-center justify-between">
            <TeamSide name={teamName(m.homeTeam)} team={m.homeTeam} />
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">
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

      <DeepChatPlaceholder context={`${teamName(m.homeTeam)} vs ${teamName(m.awayTeam)}`} />
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
  return (
    <div className={`flex flex-1 items-center gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <TeamFlag team={team} size={40} />
      <span className="text-lg font-semibold text-slate-900">{name}</span>
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
