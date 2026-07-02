'use client';

import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import type { ChampionPredictionResponse } from '@/types/api';

const latestKey = ['champion-predictions', 'latest'] as const;
const recalculateKey = ['champion-predictions', 'recalculate'] as const;

// Returns null when no champion-prediction run exists yet ({ data: null, error: null }).
export function useLatestChampionPrediction() {
  return useQuery({
    queryKey: latestKey,
    queryFn: ({ signal }) =>
      apiData<ChampionPredictionResponse | null>('/champion-predictions/latest', { signal }),
    staleTime: 60_000,
  });
}

// POST /champion-predictions/recalculate — PREMIUM only, daily quota (§1; backend
// currently PREMIUM 10/day). Runs the A/B/final legs and returns the fresh run
// (with divergence / polishedReport); seed the latest cache so the page
// reflects it immediately. A 429 AI_QUOTA_EXCEEDED surfaces as an ApiError for
// the caller to render — the limit/period live entirely in the backend
// (see quotaDetails in lib/ai.ts), never hardcode them here.
//
// This request takes minutes and has no AbortSignal wired to it, so navigating
// away does not cancel it — it keeps running and onSuccess still seeds the
// cache whenever it settles, even if the page that triggered it has unmounted.
// mutationKey lets useIsRecalculatingChampionPrediction see that from anywhere.
export function useRecalculateChampionPrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: recalculateKey,
    mutationFn: () =>
      apiData<ChampionPredictionResponse>('/champion-predictions/recalculate', { method: 'POST' }),
    onSuccess: (run) => {
      queryClient.setQueryData<ChampionPredictionResponse>(latestKey, run);
    },
  });
}

// True while a recalculate run is in flight anywhere in the app — not just on
// the component instance that started it. Lets the button correctly show
// "運算中" again after leaving and returning to the page, instead of looking
// idle and inviting a duplicate click that would burn the weekly quota.
export function useIsRecalculatingChampionPrediction(): boolean {
  return useIsMutating({ mutationKey: recalculateKey }) > 0;
}
