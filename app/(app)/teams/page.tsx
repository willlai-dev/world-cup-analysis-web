'use client';

import { useState } from 'react';
import { useTeams, type TeamListParams } from '@/features/teams/use-teams';
import { CONTINENTS, TEAM_RATING_TIERS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TeamCard } from '@/components/cards/TeamCard';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { TeamRatingTier } from '@/types/api';

const SORT_OPTIONS = [
  { label: '冠軍指數', value: 'championScore' },
  { label: '整體評級', value: 'ratingTier' },
  { label: '近期狀態', value: 'formScore' },
];

export default function TeamsPage() {
  const [filters, setFilters] = useState<TeamListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: '',
    continent: '',
    ratingTier: '',
    sortBy: 'championScore',
    sortOrder: 'desc',
  });

  const query = useTeams(filters);
  const update = (patch: Partial<TeamListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  const pagination = query.data?.pagination;

  return (
    <div>
      <PageHeading title="國家隊" description="瀏覽所有國家隊評級與冠軍指數。" />

      <FilterBar>
        <Input
          label="搜尋"
          placeholder="國家名稱"
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value })}
        />
        <Select
          label="洲別"
          placeholder="全部洲別"
          options={CONTINENTS.map((c) => ({ label: c, value: c }))}
          value={filters.continent ?? ''}
          onChange={(e) => update({ continent: e.target.value })}
        />
        <Select
          label="評級"
          placeholder="全部評級"
          options={TEAM_RATING_TIERS.map((t) => ({ label: t, value: t }))}
          value={filters.ratingTier ?? ''}
          onChange={(e) => update({ ratingTier: e.target.value as TeamRatingTier | '' })}
        />
        <Select
          label="排序"
          options={SORT_OPTIONS}
          value={filters.sortBy ?? ''}
          onChange={(e) => update({ sortBy: e.target.value })}
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
            {query.data.items.map((team) => (
              <TeamCard key={team.id} team={team} />
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
