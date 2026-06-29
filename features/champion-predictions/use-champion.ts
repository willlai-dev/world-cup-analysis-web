'use client';

import { useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import type { ChampionPredictionResponse } from '@/types/api';

export function useLatestChampionPrediction() {
  return useQuery({
    queryKey: ['champion-predictions', 'latest'],
    queryFn: ({ signal }) =>
      apiData<ChampionPredictionResponse>('/champion-predictions/latest', { signal }),
    staleTime: 60_000,
  });
}
