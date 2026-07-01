'use client';

import { useState } from 'react';
import { useTeams, type TeamListParams } from '@/features/teams/use-teams';
import { CONTINENTS, TEAM_RATING_TIERS, ELIMINATION_OPTIONS } from '@/lib/constants';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TeamCard } from '@/components/cards/TeamCard';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { TeamRatingTier } from '@/types/api';

const SORT_OPTIONS = [
  { label: '冠軍指數', value: 'championScore' },
  { label: '整體評級', value: 'ratingTier' },
  { label: '近期狀態', value: 'formScore' },
];

export default function TeamsPage() {
  const [filters, setFilters] = useState<TeamListParams>({
    search: '',
    continent: '',
    ratingTier: '',
    sortBy: 'championScore',
    sortOrder: 'desc',
  });

  const query = useTeams(filters);
  const update = (patch: Partial<TeamListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

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
          label="狀態"
          placeholder="全部狀態"
          options={ELIMINATION_OPTIONS}
          value={filters.eliminated ?? ''}
          onChange={(e) => update({ eliminated: e.target.value as 'true' | 'false' | '' })}
        />
        <div className="flex items-end gap-1">
          <Select
            label="排序"
            options={SORT_OPTIONS}
            value={filters.sortBy ?? ''}
            onChange={(e) => update({ sortBy: e.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-10 px-0"
            title={filters.sortOrder === 'asc' ? '升序，點擊切換降序' : '降序，點擊切換升序'}
            onClick={() =>
              update({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
            }
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </FilterBar>

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.items.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
