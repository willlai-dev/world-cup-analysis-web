'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { NewsCategory, NewsDetail, NewsSummary } from '@/types/api';

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
