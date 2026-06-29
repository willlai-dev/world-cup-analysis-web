'use client';

import { useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import type { HomeHighlightsResponse } from '@/types/api';

function fetchHomeHighlights(signal?: AbortSignal): Promise<HomeHighlightsResponse> {
  return apiData<HomeHighlightsResponse>('/home/highlights', { signal });
}

export function useHomeHighlights() {
  return useQuery({
    queryKey: ['home', 'highlights'],
    queryFn: ({ signal }) => fetchHomeHighlights(signal),
    staleTime: 60_000,
  });
}
