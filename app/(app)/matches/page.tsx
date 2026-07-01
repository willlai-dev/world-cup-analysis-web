'use client';

import { useState } from 'react';
import { useMatches, type MatchListParams } from '@/features/matches/use-matches';
import { MATCH_STATUSES, MATCH_STAGES } from '@/lib/constants';
import { stageLabel } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MatchCard } from '@/components/cards/MatchCard';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { MatchStage, MatchStatus } from '@/types/api';

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: '未開始',
  LIVE: '進行中',
  FINISHED: '已結束',
  POSTPONED: '延期',
  CANCELLED: '取消',
};

export default function MatchesPage() {
  const [filters, setFilters] = useState<MatchListParams>({
    status: '',
    stage: '',
    dateFrom: '',
    groupName: '',
  });

  const query = useMatches(filters);
  const update = (patch: Partial<MatchListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div>
      <PageHeading title="賽事" description="查看所有賽事的賽前預測與賽後分析。" />

      <FilterBar>
        <Select
          label="狀態"
          placeholder="全部狀態"
          options={MATCH_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))}
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value as MatchStatus | '' })}
        />
        <Select
          label="階段"
          placeholder="全部階段"
          options={MATCH_STAGES.map((s) => ({ label: stageLabel(s), value: s }))}
          value={filters.stage ?? ''}
          onChange={(e) => update({ stage: e.target.value as MatchStage | '' })}
        />
        <Input
          label="分組"
          placeholder="例如：A"
          value={filters.groupName ?? ''}
          onChange={(e) => update({ groupName: e.target.value })}
        />
        <Input
          label="日期起"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => update({ dateFrom: e.target.value })}
        />
      </FilterBar>

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.items.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
