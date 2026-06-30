'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type {
  AiReport,
  MatchDetail,
  MatchPrediction,
  MatchStage,
  MatchStatus,
  MatchSummary,
} from '@/types/api';

export type MatchListParams = {
  page?: number;
  pageSize?: number;
  status?: MatchStatus | '';
  stage?: MatchStage | '';
  dateFrom?: string;
  dateTo?: string;
  teamId?: string;
  groupName?: string;
};

export function useMatches(params: MatchListParams) {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: ({ signal }) =>
      fetchList<MatchSummary>('/matches', cleanParams(params), signal),
    placeholderData: keepPreviousData,
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'detail', matchId],
    queryFn: ({ signal }) => apiData<MatchDetail>(`/matches/${matchId}`, { signal }),
    enabled: !!matchId,
  });
}

export function useMatchAnalysis(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'analysis', matchId],
    queryFn: ({ signal }) => apiData<AiReport | null>(`/matches/${matchId}/analysis`, { signal }),
    enabled: !!matchId,
  });
}

export function useMatchPrediction(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'prediction', matchId],
    queryFn: ({ signal }) =>
      apiData<MatchPrediction | null>(`/matches/${matchId}/prediction`, { signal }),
    enabled: !!matchId,
  });
}

export function useMatchPostReport(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'post-match-report', matchId],
    queryFn: ({ signal }) =>
      apiData<AiReport | null>(`/matches/${matchId}/post-match-report`, { signal }),
    enabled: !!matchId,
  });
}
