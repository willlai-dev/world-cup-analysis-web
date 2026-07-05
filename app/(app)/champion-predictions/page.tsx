'use client';

import {
  useIsRecalculatingChampionPrediction,
  useLatestChampionPrediction,
  useRecalculateChampionPrediction,
} from '@/features/champion-predictions/use-champion';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Markdown } from '@/components/ui/Markdown';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { AiQuotaNotice } from '@/components/ai/AiQuotaNotice';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { ChampionDivergencePanel } from '@/components/ai/ChampionDivergencePanel';
import { DeepChat } from '@/components/ai/DeepChat';
import { PremiumGate } from '@/components/auth/RoleGate';
import { useAuth } from '@/features/auth/use-auth';
import { aiErrorMessage, isQuotaError } from '@/lib/ai';
import { COPY } from '@/lib/constants';
import { PageHeading } from '@/components/layout/PageHeading';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { teamName, teamTierLabel, eliminationLabel, formatDateTime, jobStatusLabel } from '@/lib/formatters';
import type { AiReport, ChampionPredictionEntry } from '@/types/api';

export default function ChampionPredictionsPage() {
  const query = useLatestChampionPrediction();
  const recalc = useRecalculateChampionPrediction();
  // Also true when a run started from a previous mount (e.g. before navigating
  // away and back) is still in flight — the request itself keeps running either
  // way, this just keeps the button/status text honest across that remount.
  const isRecalculating = useIsRecalculatingChampionPrediction();
  const recalcBusy = recalc.isPending || isRecalculating;
  const { isPremium } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="冠軍預測"
        description="AI 冠軍預測排行、奪冠傾向與模型報告。"
        action={
          // PREMIUM-only. USER sees a disabled button that says it can't be used.
          isPremium ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={recalcBusy}
              onClick={() => recalc.mutate()}
            >
              {recalcBusy ? '運算中…' : '重新跑預測'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled title={COPY.forbidden}>
              重新跑預測（高級會員）
            </Button>
          )
        }
      />

      {/* Recalculate feedback: quota 429 gets the dedicated notice; other errors a line. */}
      {recalc.isError &&
        (isQuotaError(recalc.error) ? (
          <AiQuotaNotice error={recalc.error} />
        ) : (
          <p className="text-sm text-red-600">{aiErrorMessage(recalc.error)}</p>
        ))}
      {recalcBusy && (
        <p className="text-sm text-slate-500" role="status">
          正在重新運算冠軍預測，最長可能需要約 5 分鐘，可以先切換到其他頁面，完成後回來即可看到最新結果…
        </p>
      )}

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>本次運算狀態：{jobStatusLabel(query.data.status)}</span>
              <span>更新於 {formatDateTime(query.data.completedAt ?? query.data.createdAt)}</span>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>冠軍預測排行</CardTitle>
            </CardHeader>
            <CardBody>
              {query.data.entries.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="flex flex-col gap-3">
                  {query.data.entries.map((entry) => (
                    <ChampionEntryRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* §2 Model divergence — only when computable (mock/old runs hide it). */}
          {query.data.divergence?.computable && (
            <ChampionDivergencePanel divergence={query.data.divergence} />
          )}

          {/* Model reports as tabs (§3). 彙整 prefers the polished markdown report;
              模型 A/B are PREMIUM-only cross-model analysis. */}
          <Card>
            <CardHeader>
              <CardTitle>模型報告</CardTitle>
            </CardHeader>
            <CardBody>
              <Tabs
                items={[
                  {
                    id: 'final',
                    label: '彙整',
                    content: (
                      <FinalReportTab
                        polished={query.data.polishedReport}
                        finalReport={query.data.finalReport}
                      />
                    ),
                  },
                  {
                    id: 'nvidia',
                    label: '模型 A（NVIDIA）',
                    content: (
                      <PremiumGate feature="雙模型交叉分析">
                        <AiReportCard title="NVIDIA 分析 A" report={query.data.nvidiaReport} />
                      </PremiumGate>
                    ),
                  },
                  {
                    id: 'qwen',
                    label: '模型 B（Qwen）',
                    content: (
                      <PremiumGate feature="雙模型交叉分析">
                        <AiReportCard title="Qwen 分析 B" report={query.data.qwenReport} />
                      </PremiumGate>
                    ),
                  },
                ]}
              />
            </CardBody>
          </Card>

          <DeepChat endpoint="/champion-predictions/deep-chat" context="冠軍預測" />
        </>
      )}
    </div>
  );
}

// §3: prefer polishedReport.content (markdown); fall back to the raw finalReport.
function FinalReportTab({
  polished,
  finalReport,
}: {
  polished?: AiReport | null;
  finalReport?: AiReport | null;
}) {
  const markdown = polished?.content?.trim();
  if (markdown) {
    return (
      <Card data-testid="polished-report">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{polished?.title || '彙整報告（潤稿）'}</CardTitle>
          <AiSourceMeta
            provider={polished!.provider}
            model={polished!.model}
            updatedAt={polished!.updatedAt}
          />
        </CardHeader>
        <CardBody>
          <Markdown content={markdown} />
        </CardBody>
      </Card>
    );
  }
  return <AiReportCard title="彙整報告" report={finalReport} />;
}

function ChampionEntryRow({ entry }: { entry: ChampionPredictionEntry }) {
  return (
    <li className="rounded-lg border border-slate-200 p-4" data-testid="champion-entry">
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold text-brand-700">#{entry.rank}</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TeamFlag team={entry.team} size={24} />
            <span className="font-semibold text-slate-900">{teamName(entry.team)}</span>
            {entry.ratingTier && entry.ratingTier !== 'UNKNOWN' && (
              <Badge tone="brand">{teamTierLabel(entry.ratingTier)}</Badge>
            )}
            {entry.team.isEliminated && <Badge tone="neutral">{eliminationLabel(true)}</Badge>}
            {entry.championScore > 0 && (
              <span className="text-xs text-slate-400">冠軍指數 {entry.championScore}</span>
            )}
          </div>

          {/* championScore is mostly 0 today; probabilityText carries the lean. */}
          {entry.probabilityText && (
            <p className="mt-1 text-sm font-medium text-slate-700">{entry.probabilityText}</p>
          )}

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {entry.strengths.length > 0 && (
              <FactorMini title="優勢" tone="green" items={entry.strengths} />
            )}
            {entry.risks.length > 0 && <FactorMini title="風險" tone="amber" items={entry.risks} />}
          </div>

          {entry.aiComment && <p className="mt-2 text-xs text-slate-500">{entry.aiComment}</p>}
        </div>
      </div>
    </li>
  );
}

function FactorMini({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'green' | 'amber';
}) {
  const dot = tone === 'green' ? 'text-green-600' : 'text-amber-600';
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold text-slate-600">{title}</h4>
      <ul className="flex flex-col gap-0.5 text-xs text-slate-600">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span className={dot} aria-hidden>
              ●
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
