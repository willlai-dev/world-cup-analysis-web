'use client';

import { useLatestChampionPrediction } from '@/features/champion-predictions/use-champion';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { ChampionRankBar } from '@/components/charts/ChampionRankBar';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { DeepChatPlaceholder } from '@/components/ai/DeepChatPlaceholder';
import { PremiumGate } from '@/components/auth/RoleGate';
import { useAuth } from '@/features/auth/use-auth';
import { COPY } from '@/lib/constants';
import { PageHeading } from '@/components/layout/PageHeading';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { teamName, teamTierLabel, formatDateTime } from '@/lib/formatters';

export default function ChampionPredictionsPage() {
  const query = useLatestChampionPrediction();
  const { isPremium } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="冠軍預測"
        description="AI 冠軍預測排行、國家評級與預測理由。"
        action={
          // PREMIUM-only. USER sees a disabled button that says it can't be used.
          <Button
            variant="outline"
            size="sm"
            disabled
            title={isPremium ? 'Phase 3 開放' : COPY.forbidden}
          >
            {isPremium ? '重新跑預測' : '重新跑預測（高級會員）'}
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <EmptyState />
      ) : (
        <>
          <Card>
            <CardBody className="flex items-center justify-between text-sm text-slate-600">
              <span>本次運算狀態：{query.data.status}</span>
              <span>更新於 {formatDateTime(query.data.completedAt ?? query.data.createdAt)}</span>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>冠軍預測排行</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {query.data.entries.length === 0 ? (
                <div className="p-4">
                  <EmptyState />
                </div>
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>排名</TH>
                      <TH>國家</TH>
                      <TH>評級</TH>
                      <TH>冠軍指數</TH>
                      <TH>理由</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {query.data.entries.map((entry) => (
                      <TR key={entry.id}>
                        <TD className="font-bold text-brand-700">#{entry.rank}</TD>
                        <TD>
                          <span className="flex items-center gap-2">
                            <TeamFlag team={entry.team} size={24} />
                            {teamName(entry.team)}
                          </span>
                        </TD>
                        <TD>
                          <Badge tone="brand">{teamTierLabel(entry.ratingTier)}</Badge>
                        </TD>
                        <TD className="w-40">
                          <ChampionRankBar score={entry.championScore} />
                        </TD>
                        <TD className="max-w-xs text-xs text-slate-500">
                          {entry.aiComment ?? entry.strengths.slice(0, 2).join('、') ?? '—'}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardBody>
          </Card>

          <AiReportCard title="最終 AI 報告" report={query.data.finalReport} />

          {/* Dual-model cross analysis & disagreement land in Phase 2/3. */}
          <PremiumGate feature="雙模型交叉分析">
            <div className="grid gap-4 md:grid-cols-2">
              <AiReportCard title="NVIDIA 分析 A" report={query.data.nvidiaReport} />
              <AiReportCard title="Qwen 分析 B" report={query.data.qwenReport} />
            </div>
          </PremiumGate>

          <DeepChatPlaceholder context="冠軍預測" />
        </>
      )}
    </div>
  );
}
