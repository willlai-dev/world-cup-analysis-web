'use client';

import { useState } from 'react';
import { useMatches, type MatchListParams } from '@/features/matches/use-matches';
import { MATCH_STATUSES, MATCH_STAGES } from '@/lib/constants';
import { matchStatusLabel, stageLabel } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MatchCard } from '@/components/cards/MatchCard';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { MatchStage, MatchStatus } from '@/types/api';

export default function MatchesPage() {
  const [filters, setFilters] = useState<MatchListParams>({
    status: '',
    stage: '',
    dateFrom: '',
    dateTo: '',
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
          options={MATCH_STATUSES.map((s) => ({ label: matchStatusLabel(s), value: s }))}
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
          max={filters.dateTo || undefined}
          value={filters.dateFrom ?? ''}
          onChange={(e) => {
            const dateFrom = e.target.value;
            // Clear an existing dateTo that would now be before dateFrom,
            // so we never submit an inverted range to the API.
            const dateTo = filters.dateTo && dateFrom > filters.dateTo ? '' : filters.dateTo;
            update({ dateFrom, dateTo });
          }}
        />
        <Input
          label="日期迄"
          type="date"
          min={filters.dateFrom || undefined}
          value={filters.dateTo ?? ''}
          onChange={(e) => update({ dateTo: e.target.value })}
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
