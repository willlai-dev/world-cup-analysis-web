'use client';

import { useQuery } from '@tanstack/react-query';
import { apiData, ApiError } from '@/lib/api-client';
import type { PredictionInsights } from '@/types/api';

function fetchPredictionInsights(signal?: AbortSignal): Promise<PredictionInsights> {
  return apiData<PredictionInsights>('/insights/predictions', { signal });
}

export function usePredictionInsights() {
  return useQuery({
    queryKey: ['insights', 'predictions'],
    queryFn: ({ signal }) => fetchPredictionInsights(signal),
    staleTime: 60_000,
    // PREMIUM-only endpoint: a 403 for USER is a stable answer, not a flake.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && (error.isForbidden || error.isUnauthorized)) &&
      failureCount < 2,
  });
}
