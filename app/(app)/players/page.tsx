'use client';

import { useState } from 'react';
import { usePlayers, type PlayerListParams } from '@/features/players/use-players';
import { useTeams } from '@/features/teams/use-teams';
import { PLAYER_POSITIONS, ELIMINATION_OPTIONS } from '@/lib/constants';
import { positionLabel, teamName } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PlayerCard } from '@/components/cards/PlayerCard';
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
    search: '',
    position: '',
    sortBy: 'overallScore',
    sortOrder: 'desc',
  });

  const query = usePlayers(filters);
  const teamsQuery = useTeams({});
  const allTeams = teamsQuery.data?.items ?? [];
  const filteredTeams =
    filters.eliminated === 'false'
      ? allTeams.filter((t) => !t.isEliminated)
      : filters.eliminated === 'true'
        ? allTeams.filter((t) => t.isEliminated)
        : allTeams;
  const teamOptions = [...filteredTeams]
    .sort((a, b) => teamName(a).localeCompare(teamName(b), 'zh-TW'))
    .map((t) => ({ label: teamName(t), value: t.id }));
  const update = (patch: Partial<PlayerListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div>
      <PageHeading title="球員" description="瀏覽所有球員的能力值與 AI 評級。" />

      <FilterBar>
        {/* 狀態 + 國家：狀態優先決定國家選項範圍 */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium leading-none text-slate-400">
            狀態優先 · 國家依狀態篩選
          </span>
          <div className="flex items-end gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Select
              label="參賽狀態"
              placeholder="全部狀態"
              options={ELIMINATION_OPTIONS}
              value={filters.eliminated ?? ''}
              onChange={(e) => {
                const eliminated = e.target.value as 'true' | 'false' | '';
                update({ eliminated, teamId: '' });
              }}
            />
            <Select
              label={
                filters.eliminated === 'false'
                  ? '國家 (仍在賽)'
                  : filters.eliminated === 'true'
                    ? '國家 (已淘汰)'
                    : '國家'
              }
              placeholder="全部國家"
              options={teamOptions}
              value={filters.teamId ?? ''}
              onChange={(e) => update({ teamId: e.target.value || '' })}
            />
          </div>
        </div>

        <Select
          label="位置"
          placeholder="全部位置"
          options={PLAYER_POSITIONS.map((p) => ({ label: positionLabel(p), value: p }))}
          value={filters.position ?? ''}
          onChange={(e) => update({ position: e.target.value as PlayerPosition | '' })}
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
        <Input
          label="搜尋"
          placeholder="球員名稱"
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value })}
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
          {query.data.items.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
