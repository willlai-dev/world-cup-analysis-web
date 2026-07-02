'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchAiUsage } from '@/features/admin/ai-usage-api';
import type { AiUsageQuery } from '@/types/api';

export function useAiUsage(params: AiUsageQuery) {
  return useQuery({
    queryKey: ['admin', 'ai-usage', params],
    queryFn: ({ signal }) => fetchAiUsage(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
