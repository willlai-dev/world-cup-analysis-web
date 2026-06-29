'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { PlayerDetail, PlayerPosition, PlayerRatingTier, PlayerSummary } from '@/types/api';

export type PlayerListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  teamId?: string;
  position?: PlayerPosition | '';
  ratingTier?: PlayerRatingTier | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '';
};

export function usePlayers(params: PlayerListParams) {
  return useQuery({
    queryKey: ['players', params],
    queryFn: ({ signal }) => fetchList<PlayerSummary>('/players', cleanParams(params), signal),
    placeholderData: keepPreviousData,
  });
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['players', 'detail', playerId],
    queryFn: ({ signal }) => apiData<PlayerDetail>(`/players/${playerId}`, { signal }),
    enabled: !!playerId,
  });
}
