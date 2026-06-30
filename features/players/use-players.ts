'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { AiReport, PlayerPosition, PlayerRatingTier, PlayerSummary } from '@/types/api';

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
