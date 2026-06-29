'use client';

import { useState } from 'react';
import { useMatches, type MatchListParams } from '@/features/matches/use-matches';
import { MATCH_STATUSES, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MatchCard } from '@/components/cards/MatchCard';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { MatchStatus } from '@/types/api';

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: '未開始',
  LIVE: '進行中',
  FINISHED: '已結束',
  POSTPONED: '延期',
  CANCELLED: '取消',
};

export default function MatchesPage() {
  const [filters, setFilters] = useState<MatchListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    status: '',
    stage: '',
    dateFrom: '',
    groupName: '',
  });

  const query = useMatches(filters);
  const update = (patch: Partial<MatchListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));

  const pagination = query.data?.pagination;

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
        <Input
          label="階段"
          placeholder="例如：小組賽"
          value={filters.stage ?? ''}
          onChange={(e) => update({ stage: e.target.value })}
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => update({ page })}
            />
          )}
        </>
      )}
    </div>
  );
}
