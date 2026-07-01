'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchAll, type ListResult } from '@/lib/list';
import type {
  AiReport,
  MatchSummary,
  PlayerSummary,
  TeamRatingTier,
  TeamSummary,
} from '@/types/api';

export type TeamListParams = {
  search?: string;
  continent?: string;
  ratingTier?: TeamRatingTier | '';
  // Phase 2: filter by elimination status. Backend expects the string "true"/"false".
  eliminated?: 'true' | 'false' | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '';
};

// Non-eliminated teams first. Array.prototype.sort is stable, so the backend's
// ordering (championScore etc.) is preserved within each group.
export function sortTeams(items: TeamSummary[]): TeamSummary[] {
  return [...items].sort((a, b) => Number(a.isEliminated) - Number(b.isEliminated));
}

export function useTeams(params: TeamListParams) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: ({ signal }) => fetchAll<TeamSummary>('/teams', cleanParams(params), signal),
    select: (data): ListResult<TeamSummary> => {
      const key = (params.sortBy ?? 'championScore') as keyof TeamSummary;
      const items = [...data.items].sort((a, b) => {
        // Non-eliminated teams first (preserved from original sortTeams)
        const elimDiff = Number(a.isEliminated) - Number(b.isEliminated);
        if (elimDiff !== 0) return elimDiff;
        // Null-last within each elimination group
        const aVal = a[key];
        const bVal = b[key];
        if (aVal == null && bVal != null) return 1;
        if (aVal != null && bVal == null) return -1;
        return 0;
      });
      return { ...data, items };
    },
    placeholderData: keepPreviousData,
  });
}

// GET /teams/:teamId returns a bare TeamSummary. analysis / players / matches
// are separate sub-resources (see hooks below).
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', 'detail', teamId],
    queryFn: ({ signal }) => apiData<TeamSummary>(`/teams/${teamId}`, { signal }),
    enabled: !!teamId,
  });
}

export function useTeamAnalysis(teamId: string) {
  return useQuery({
    queryKey: ['teams', 'analysis', teamId],
    queryFn: ({ signal }) => apiData<AiReport | null>(`/teams/${teamId}/analysis`, { signal }),
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
