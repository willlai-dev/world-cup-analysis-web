'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiData } from '@/lib/api-client';
import { cleanParams, fetchList } from '@/lib/list';
import type { NewsDetail, NewsSummary } from '@/types/api';

export type NewsListParams = {
  page?: number;
  pageSize?: number;
  category?: string;
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
