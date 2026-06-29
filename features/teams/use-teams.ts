'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { MatchSummary, PlayerSummary, TeamDetail, TeamRatingTier, TeamSummary } from '@/types/api';

export type TeamListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  continent?: string;
  ratingTier?: TeamRatingTier | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '';
};

export function useTeams(params: TeamListParams) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: ({ signal }) => fetchList<TeamSummary>('/teams', cleanParams(params), signal),
    placeholderData: keepPreviousData,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', 'detail', teamId],
    queryFn: ({ signal }) => apiData<TeamDetail>(`/teams/${teamId}`, { signal }),
    enabled: !!teamId,
  });
}

export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: ['teams', 'players', teamId],
    queryFn: ({ signal }) => apiData<PlayerSummary[]>(`/teams/${teamId}/players`, { signal }),
    enabled: !!teamId,
  });
}

export function useTeamMatches(teamId: string) {
  return useQuery({
    queryKey: ['teams', 'matches', teamId],
    queryFn: ({ signal }) => apiData<MatchSummary[]>(`/teams/${teamId}/matches`, { signal }),
    enabled: !!teamId,
  });
}
