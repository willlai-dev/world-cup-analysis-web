'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchAll, type ListResult } from '@/lib/list';
import type { AiReport, PlayerPosition, PlayerRatingTier, PlayerSummary } from '@/types/api';

export type PlayerListParams = {
  search?: string;
  teamId?: string;
  position?: PlayerPosition | '';
  ratingTier?: PlayerRatingTier | '';
  // Phase 2: filter by the player's team elimination status ("true"/"false").
  eliminated?: 'true' | 'false' | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '';
};

export function usePlayers(params: PlayerListParams) {
  return useQuery({
    queryKey: ['players', params],
    queryFn: ({ signal }) => fetchAll<PlayerSummary>('/players', cleanParams(params), signal),
    select: (data): ListResult<PlayerSummary> => {
      const key = (params.sortBy ?? 'overallScore') as keyof PlayerSummary;
      return {
        ...data,
        items: [...data.items].sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal == null && bVal != null) return 1;
          if (aVal != null && bVal == null) return -1;
          return 0;
        }),
      };
    },
    placeholderData: keepPreviousData,
  });
}

// GET /players/:playerId returns a PlayerSummary (with nested team). The AI
// analysis is a separate sub-resource; there is no relatedNews on this endpoint.
export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['players', 'detail', playerId],
    queryFn: ({ signal }) => apiData<PlayerSummary>(`/players/${playerId}`, { signal }),
    enabled: !!playerId,
  });
}

export function usePlayerAnalysis(playerId: string) {
  return useQuery({
    queryKey: ['players', 'analysis', playerId],
    queryFn: ({ signal }) => apiData<AiReport | null>(`/players/${playerId}/analysis`, { signal }),
    enabled: !!playerId,
  });
}

// AI rating report (PLAYER_RATING / PLAYER_HEXAGON_ANALYSIS). Phase 2 hexagon
// chart will also build on this; Phase 1 surfaces it as a plain report card.
export function usePlayerRating(playerId: string) {
  return useQuery({
    queryKey: ['players', 'rating', playerId],
    queryFn: ({ signal }) => apiData<AiReport | null>(`/players/${playerId}/rating`, { signal }),
    enabled: !!playerId,
  });
}
