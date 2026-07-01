'use client';

import { useEffect, useRef } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiData, apiFetch } from '@/lib/api-client';
import { cleanParams, fetchAll, type ListResult } from '@/lib/list';
import type {
  AiReport,
  MatchDetail,
  MatchPrediction,
  MatchStage,
  MatchStatus,
  MatchSummary,
  RefreshMeta,
} from '@/types/api';

export type MatchListParams = {
  status?: MatchStatus | '';
  stage?: MatchStage | '';
  dateFrom?: string;
  dateTo?: string;
  teamId?: string;
  groupName?: string;
};

// Display order: live matches first, then upcoming, then everything else, with
// finished matches last and finished group-stage matches at the very bottom.
const STATUS_RANK: Record<MatchStatus, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  POSTPONED: 2,
  CANCELLED: 3,
  FINISHED: 4,
};

function matchRank(match: MatchSummary): number {
  if (match.status === 'FINISHED') {
    return match.stage === 'GROUP' ? 6 : 5;
  }
  return STATUS_RANK[match.status];
}

// Pure sort used by the matches list (backend returns kickoffAt ASC only).
export function sortMatches(items: MatchSummary[]): MatchSummary[] {
  return [...items].sort((a, b) => {
    const rankDiff = matchRank(a) - matchRank(b);
    if (rankDiff !== 0) return rankDiff;
    const at = new Date(a.kickoffAt).getTime();
    const bt = new Date(b.kickoffAt).getTime();
    // Finished matches: most recent first. Others: soonest kickoff first.
    return a.status === 'FINISHED' ? bt - at : at - bt;
  });
}

export function useMatches(params: MatchListParams) {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: ({ signal }) => fetchAll<MatchSummary>('/matches', cleanParams(params), signal),
    select: (data): ListResult<MatchSummary> => ({ items: sortMatches(data.items) }),
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

// ---------------------------------------------------------------------------
// Match auto-refresh (POST /matches/:id/refresh)
// ---------------------------------------------------------------------------

/** Call the refresh endpoint and return typed data + refresh metadata. */
export async function refreshMatch(
  matchId: string,
): Promise<{ data: MatchDetail; refreshMeta: RefreshMeta | null }> {
  const result = await apiFetch<MatchDetail>(`/matches/${matchId}/refresh`, {
    method: 'POST',
  });
  const refreshMeta = (result.meta as { refresh?: RefreshMeta } | undefined)?.refresh ?? null;
  return { data: result.data, refreshMeta };
}

/**
 * Returns true when the frontend should call the refresh endpoint on load.
 *   - LIVE match → always refresh
 *   - SCHEDULED match whose kickoff has already passed OR is within 5 min → refresh now
 */
function shouldRefreshOnLoad(status: MatchStatus, kickoffAt: string): boolean {
  if (status === 'LIVE') return true;
  if (status === 'SCHEDULED') {
    const msUntilKickoff = new Date(kickoffAt).getTime() - Date.now();
    // Include overdue matches (msUntilKickoff < 0): kickoff passed but DB still shows SCHEDULED.
    return msUntilKickoff <= 5 * 60 * 1000;
  }
  return false;
}

/**
 * Automatically triggers a backend refresh when the user enters a match detail
 * page while the match is live or imminent (≤ 5 min to kickoff).
 *
 * - On mount: fires one refresh if conditions are met.
 * - After each LIVE refresh: schedules exactly ONE follow-up at `nextRefreshAt`.
 * - SCHEDULED kickoff approaching (≤ 60 min): schedules a timer for `kickoffAt`.
 * - Never polls in a loop; always respects the server-side cooldown window.
 * - Silently ignores network errors (auth failures handled by global guards).
 */
export function useMatchAutoRefresh(
  matchId: string,
  status: MatchStatus | undefined,
  kickoffAt: string | undefined,
) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!status || !kickoffAt) return;

    let cancelled = false;

    function clearTimer() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    async function doRefresh() {
      if (cancelled) return;
      try {
        const { data, refreshMeta } = await refreshMatch(matchId);
        if (cancelled) return;

        // Push fresh data into the React Query cache so the UI updates immediately.
        queryClient.setQueryData(['matches', 'detail', matchId], data);

        // Schedule exactly ONE follow-up if the match is still live.
        if (data.status === 'LIVE' && refreshMeta?.nextRefreshAt) {
          const delay = Math.max(
            1000,
            new Date(refreshMeta.nextRefreshAt).getTime() - Date.now() + 200,
          );
          clearTimer();
          timerRef.current = setTimeout(doRefresh, delay);
        }
      } catch {
        // Silently ignore: 401/403/404 are handled elsewhere.
      }
    }

    if (shouldRefreshOnLoad(status, kickoffAt)) {
      // Immediate refresh.
      void doRefresh();
    } else if (status === 'SCHEDULED') {
      // Schedule a refresh at kickoff if it's within the next 60 minutes.
      const msUntilKickoff = new Date(kickoffAt).getTime() - Date.now();
      if (msUntilKickoff > 0 && msUntilKickoff <= 60 * 60 * 1000) {
        clearTimer();
        timerRef.current = setTimeout(doRefresh, msUntilKickoff);
      }
    }

    return () => {
      cancelled = true;
      clearTimer();
    };
    // Re-run only when the match identity or live status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, status]);
}
