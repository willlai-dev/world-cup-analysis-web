'use client';

import { useState } from 'react';
import { usePlayers, type PlayerListParams } from '@/features/players/use-players';
import { PLAYER_POSITIONS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { positionLabel } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { PlayerPosition } from '@/types/api';

const SORT_OPTIONS = [
  { label: '總分', value: 'overallScore' },
  { label: '進攻', value: 'attackScore' },
  { label: '創造', value: 'creativityScore' },
  { label: '技術', value: 'techniqueScore' },
  { label: '防守', value: 'defenseScore' },
  { label: '身體', value: 'physicalScore' },
  { label: '狀態', value: 'formScore' },
];

export default function PlayersPage() {
  const [filters, setFilters] = useState<PlayerListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: '',
    position: '',
    sortBy: 'overallScore',
    sortOrder: 'desc',
  });

  const query = usePlayers(filters);
  const update = (patch: Partial<PlayerListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  const pagination = query.data?.pagination;

  return (
    <div>
      <PageHeading title="球員" description="瀏覽所有球員的能力值與 AI 評級。" />

      <FilterBar>
        <Input
          label="搜尋"
          placeholder="球員名稱"
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value })}
        />
        <Select
          label="位置"
          placeholder="全部位置"
          options={PLAYER_POSITIONS.map((p) => ({ label: positionLabel(p), value: p }))}
          value={filters.position ?? ''}
          onChange={(e) => update({ position: e.target.value as PlayerPosition | '' })}
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
            {query.data.items.map((player) => (
              <PlayerCard key={player.id} player={player} />
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
