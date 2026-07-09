'use client';

import { usePredictionInsights } from '@/features/insights/use-insights';
import { ApiError } from '@/lib/api-client';
import { COPY } from '@/lib/constants';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDateTime, formatPercent, stageLabel, teamName } from '@/lib/formatters';
import type {
  PredictionInsightsBucket,
  PredictionOutcomeItem,
  PredictionTendency,
} from '@/types/api';

const TENDENCY_LABELS: Record<PredictionTendency, string> = {
  HOME: '主勝',
  DRAW: '和局',
  AWAY: '客勝',
};

function tendencyLabel(t: PredictionTendency | null): string {
  return t ? TENDENCY_LABELS[t] : '—';
}

export default function InsightsPage() {
  const { data, isLoading, isError, error, refetch } = usePredictionInsights();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">預測戰績</h1>
        <Badge tone="premium">PREMIUM</Badge>
      </div>
      <p className="mb-8 max-w-3xl text-sm text-slate-500">
        AI 賽前預測與實際比分的對照統計。「賽前預測」是開賽前真正生成的預測，最能反映模型準確度；
        「回補預測」是賽後以賽前資訊重建的分析，模型可能記得實際結果，數據僅供參考、不納入準確度評估。
      </p>

      {isLoading && <LoadingState />}
      {isError && error instanceof ApiError && error.isForbidden ? (
        <div data-testid="premium-locked" className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-2">
            <Badge tone="premium">PREMIUM</Badge>
            <span className="text-sm font-medium text-slate-700">預測戰績為 PREMIUM 專屬功能</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{COPY.forbidden}</p>
        </div>
      ) : (
        isError && <ErrorState error={error} onRetry={() => refetch()} />
      )}

      {data && (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-1 text-lg font-bold text-slate-900">賽前預測</h2>
            <p className="mb-4 text-sm text-slate-500">開賽前真正生成的預測 — 模型的真實成績單。</p>
            {data.summary.real.total === 0 ? (
              <Card>
                <CardBody className="text-sm text-slate-500">
                  目前還沒有可結算的賽前預測。系統每天為即將開賽的比賽生成預測，完賽後會自動結算並累積到這裡。
                </CardBody>
              </Card>
            ) : (
              <BucketTiles bucket={data.summary.real} />
            )}
          </section>

          <section>
            <h2 className="mb-1 text-lg font-bold text-slate-900">回補預測</h2>
            <p className="mb-4 text-sm text-slate-500">
              賽後以「開賽前已知資訊」重建的預測（標示 <Badge tone="warning">回補</Badge>）— 僅供參考。
            </p>
            {data.summary.retro.total === 0 ? (
              <Card>
                <CardBody className="text-sm text-slate-500">目前沒有回補預測。</CardBody>
              </Card>
            ) : (
              <BucketTiles bucket={data.summary.retro} muted />
            )}
          </section>

          {(data.summary.real.programTotal ?? 0) > 0 && (
            <section>
              <h2 className="mb-1 text-lg font-bold text-slate-900">比分預測對比：AI 原始 vs 程式混合</h2>
              <p className="mb-4 text-sm text-slate-500">
                「程式混合」以 Poisson 進球模型與 AI 比分加權混合後重排前三比分（權重依歷史命中自動擬合）。
                滾動參數回測，僅計真實賽前預測。
              </p>
              <ScoreComparisonTiles bucket={data.summary.real} />
            </section>
          )}

          {data.calibration && data.calibration.temperature != null && (
            <section>
              <h2 className="mb-1 text-lg font-bold text-slate-900">機率校正</h2>
              <p className="mb-4 text-sm text-slate-500">
                以歷史賽前預測擬合「校正溫度 T」（temperature scaling，最小化 log loss），
                再依各隊過往的預測偏差做小幅收縮調整（樣本越少調整越小）。只採計真實賽前預測。
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <CalibrationTile label="樣本數" value={`${data.calibration.sampleSize} 場`}
                  hint={data.calibration.applied ? '校正已啟用' : '未滿 10 場，尚未啟用'} />
                <CalibrationTile label="平均信心" value={formatPercent(data.calibration.avgConfidence)}
                  hint="模型給自家預測傾向的平均機率" />
                <CalibrationTile label="實際命中率" value={formatPercent(data.calibration.tendencyHitRate)}
                  hint="預測傾向真的發生的比例" />
                <CalibrationTile label="校正溫度 T" value={data.calibration.temperature.toFixed(2)}
                  hint={data.calibration.temperature > 1 ? '模型偏過度自信 → 機率收斂' : '模型偏保守 → 機率銳化'} />
                <CalibrationTile
                  label="Brier 回測"
                  value={
                    data.calibration.baselineBrier != null && data.calibration.calibratedBrier != null
                      ? `${data.calibration.baselineBrier.toFixed(3)} → ${data.calibration.calibratedBrier.toFixed(3)}`
                      : '—'
                  }
                  hint={brierImprovementHint(data.calibration.baselineBrier, data.calibration.calibratedBrier)}
                />
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">分輪次統計</h2>
            {data.byStage.length === 0 ? (
              <EmptyState />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-4 py-3 font-medium">輪次</th>
                        <th className="px-4 py-3 text-right font-medium">場次</th>
                        <th className="px-4 py-3 text-right font-medium">傾向命中率</th>
                        <th className="px-4 py-3 text-right font-medium">前三比分命中率</th>
                        <th className="px-4 py-3 text-right font-medium">平均 Brier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byStage.map((s) => (
                        <tr key={s.stage} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-slate-800">{stageLabel(s.stage)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{s.total}</td>
                          <td className="px-4 py-3 text-right text-slate-800">
                            {formatPercent(s.tendencyHitRate)}
                            <span className="ml-1 text-xs text-slate-400">
                              ({s.tendencyHits}/{s.total})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-800">
                            {formatPercent(s.top3ScoreHitRate)}
                            <span className="ml-1 text-xs text-slate-400">
                              ({s.top3ScoreHits}/{s.total})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-800">
                            {s.avgBrier != null ? s.avgBrier.toFixed(3) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>

          {data.byTeam.length > 0 && (
            <section>
              <h2 className="mb-1 text-lg font-bold text-slate-900">各隊預測偏差</h2>
              <p className="mb-4 text-sm text-slate-500">
                「超出預期」代表實際結果比預測傾向更好（例如預測輸球卻贏了）；含回補樣本，僅供參考。
              </p>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-4 py-3 font-medium">國家隊</th>
                        <th className="px-4 py-3 text-right font-medium">場次</th>
                        <th className="px-4 py-3 text-right font-medium">傾向命中率</th>
                        <th className="px-4 py-3 text-right font-medium">超出預期</th>
                        <th className="px-4 py-3 text-right font-medium">低於預期</th>
                        <th className="px-4 py-3 text-right font-medium">回補樣本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byTeam.map((t) => (
                        <tr key={t.team.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-800">
                              <TeamFlag team={t.team} size={18} />
                              {teamName(t.team)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{t.total}</td>
                          <td className="px-4 py-3 text-right text-slate-800">
                            {formatPercent(t.tendencyHitRate)}
                            <span className="ml-1 text-xs text-slate-400">({t.tendencyHits}/{t.total})</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {t.overPerformed > 0 ? (
                              <span className="font-medium text-green-700">+{t.overPerformed}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {t.underPerformed > 0 ? (
                              <span className="font-medium text-red-700">-{t.underPerformed}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400">{t.retroCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}

          <section>
            <h2 className="mb-1 text-lg font-bold text-slate-900">逐場對照</h2>
            <p className="mb-4 text-sm text-slate-500">最近完賽在前；Brier 越低代表預測機率越貼近實際結果（0 最佳、2 最差）。</p>
            {data.items.length === 0 ? (
              <EmptyState />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-4 py-3 font-medium">賽事</th>
                        <th className="px-4 py-3 font-medium">輪次</th>
                        <th className="px-4 py-3 font-medium">預測傾向</th>
                        <th className="px-4 py-3 font-medium">預測比分</th>
                        <th className="px-4 py-3 font-medium">程式比分</th>
                        <th className="px-4 py-3 font-medium">實際</th>
                        <th className="px-4 py-3 font-medium">命中</th>
                        <th className="px-4 py-3 text-right font-medium">Brier</th>
                        <th className="px-4 py-3 font-medium">來源</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <OutcomeRow key={item.matchId} item={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// AI-raw vs program-blend scoreline hit rates, side by side (real samples only).
function ScoreComparisonTiles({ bucket }: { bucket: PredictionInsightsBucket }) {
  const programTotal = bucket.programTotal ?? 0;
  const tiles = [
    {
      label: 'AI 比分完全命中',
      value: formatPercent(bucket.exactScoreHitRate),
      hint: `${bucket.exactScoreHits}/${bucket.total} 場`,
    },
    {
      label: '程式混合完全命中',
      value: formatPercent(bucket.programExactScoreHitRate ?? null),
      hint: `${bucket.programExactScoreHits ?? 0}/${programTotal} 場（回測）`,
    },
    {
      label: 'AI 前三比分命中',
      value: formatPercent(bucket.top3ScoreHitRate),
      hint: `${bucket.top3ScoreHits}/${bucket.total} 場`,
    },
    {
      label: '程式混合前三命中',
      value: formatPercent(bucket.programTop3ScoreHitRate ?? null),
      hint: `${bucket.programTop3ScoreHits ?? 0}/${programTotal} 場（回測）`,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardBody>
            <p className="text-xs text-slate-500">{t.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{t.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{t.hint}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// In-sample backtest on historical pre-kickoff samples, not a live-accuracy claim.
function brierImprovementHint(baseline: number | null, calibrated: number | null): string {
  if (baseline == null || calibrated == null || baseline <= 0) return '歷史賽前樣本回測';
  const pct = ((baseline - calibrated) / baseline) * 100;
  if (pct <= 0) return '歷史賽前樣本回測 · 越低越準';
  return `歷史賽前樣本回測 · 改善 ${pct.toFixed(1)}%`;
}

function CalibrationTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </CardBody>
    </Card>
  );
}

// KPI tiles for one bucket (dataviz: hero number + muted label, no chart needed).
function BucketTiles({ bucket, muted = false }: { bucket: PredictionInsightsBucket; muted?: boolean }) {
  const tiles = [
    {
      label: '勝負傾向命中率',
      value: formatPercent(bucket.tendencyHitRate),
      hint: `${bucket.tendencyHits}/${bucket.total} 場`,
    },
    {
      label: '前三比分命中率',
      value: formatPercent(bucket.top3ScoreHitRate),
      hint: `${bucket.top3ScoreHits}/${bucket.total} 場`,
    },
    {
      label: '比分完全命中',
      value: formatPercent(bucket.exactScoreHitRate),
      hint: `${bucket.exactScoreHits}/${bucket.total} 場`,
    },
    {
      label: '平均 Brier 分數',
      value: bucket.avgBrier != null ? bucket.avgBrier.toFixed(3) : '—',
      hint: '0 最佳 · 2 最差',
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardBody>
            <p className="text-xs text-slate-500">{t.label}</p>
            <p className={`mt-1 text-2xl font-bold ${muted ? 'text-slate-600' : 'text-slate-900'}`}>
              {t.value}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{t.hint}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function OutcomeRow({ item }: { item: PredictionOutcomeItem }) {
  const topScoreline = item.likelyScorelines[0]?.score ?? '—';
  const topProgramScoreline = item.programScorelines?.[0]?.score ?? null;
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <TeamFlag team={item.homeTeam} size={18} />
          <span className="font-medium text-slate-800">{teamName(item.homeTeam)}</span>
          <span className="text-slate-400">vs</span>
          <span className="font-medium text-slate-800">{teamName(item.awayTeam)}</span>
          <TeamFlag team={item.awayTeam} size={18} />
        </div>
        <div className="mt-0.5 text-xs text-slate-400">{formatDateTime(item.kickoffAt)}</div>
      </td>
      <td className="px-4 py-3 text-slate-600">{stageLabel(item.stage)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-medium text-slate-800">{tendencyLabel(item.tendencyPredicted)}</span>
        {item.homeWinLean != null && item.drawLean != null && item.awayWinLean != null && (
          <span className="ml-1 text-xs text-slate-400">
            {Math.round(item.homeWinLean)}/{Math.round(item.drawLean)}/{Math.round(item.awayWinLean)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-800">{topScoreline}</td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-800">
        {topProgramScoreline ?? <span className="text-slate-400">—</span>}
        {/* Strict checks: null/undefined = program result not settled → no badge. */}
        {item.programExactScoreHit === true && (
          <span className="ml-1 text-xs font-medium text-green-700">全中</span>
        )}
        {item.programExactScoreHit === false && item.programTop3ScoreHit === true && (
          <span className="ml-1 text-xs font-medium text-brand-700">前三</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
        {item.actualHomeScore} - {item.actualAwayScore}
        <span className="ml-1 text-xs font-normal text-slate-400">
          ({tendencyLabel(item.tendencyActual)})
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Badge tone={item.tendencyHit ? 'success' : 'neutral'}>
            傾向{item.tendencyHit ? '✓' : '✗'}
          </Badge>
          {item.top3ScoreHit && (
            <Badge tone={item.exactScoreHit ? 'success' : 'brand'}>
              比分{item.exactScoreHit ? '全中' : '前三'}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-slate-800">
        {item.brierScore != null ? item.brierScore.toFixed(3) : '—'}
      </td>
      <td className="px-4 py-3">
        {item.retro ? <Badge tone="warning">回補</Badge> : <Badge tone="brand">賽前</Badge>}
      </td>
    </tr>
  );
}
