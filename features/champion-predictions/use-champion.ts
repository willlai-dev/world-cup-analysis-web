'use client';

import { useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import type { ChampionPredictionResponse } from '@/types/api';

// Returns null when no champion-prediction run exists yet ({ data: null, error: null }).
export function useLatestChampionPrediction() {
  return useQuery({
    queryKey: ['champion-predictions', 'latest'],
    queryFn: ({ signal }) =>
      apiData<ChampionPredictionResponse | null>('/champion-predictions/latest', { signal }),
    staleTime: 60_000,
  });
}
