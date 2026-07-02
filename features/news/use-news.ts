'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { AiReport, NewsCategory, NewsDetail, NewsSummary } from '@/types/api';

export type NewsListParams = {
  page?: number;
  pageSize?: number;
  category?: NewsCategory | '';
  tag?: string;
  teamId?: string;
  playerId?: string;
  sourceName?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useNewsList(params: NewsListParams) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: ({ signal }) => fetchList<NewsSummary>('/news', cleanParams(params), signal),
    placeholderData: keepPreviousData,
  });
}

export function useNewsItem(newsId: string) {
  return useQuery({
    queryKey: ['news', 'detail', newsId],
    queryFn: ({ signal }) => apiData<NewsDetail>(`/news/${newsId}`, { signal }),
    enabled: !!newsId,
  });
}

// GET /news/:id/analysis — USER/PREMIUM. Phase 3 §4 impact analysis; returns
// null until the daily job generates it (only recent, tagged, summarized news),
// so the panel must tolerate null and simply hide.
export function useNewsAnalysis(newsId: string) {
  return useQuery({
    queryKey: ['news', 'analysis', newsId],
    queryFn: ({ signal }) => apiData<AiReport | null>(`/news/${newsId}/analysis`, { signal }),
    enabled: !!newsId,
  });
}

// POST /api/news/:newsId/translate — PREMIUM only, returns the full updated
// NewsDetail (translationStatus DONE/FAILED). Seed the detail cache with the
// response so the page's title/translation reflect it immediately.
export function useTranslateNews(newsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiData<NewsDetail>(`/news/${newsId}/translate`, { method: 'POST' }),
    onSuccess: (detail) => {
      queryClient.setQueryData<NewsDetail>(['news', 'detail', newsId], detail);
    },
  });
}
