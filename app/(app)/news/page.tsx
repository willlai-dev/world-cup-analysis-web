'use client';

import { useState } from 'react';
import { useNewsList, type NewsListParams } from '@/features/news/use-news';
import { DEFAULT_PAGE_SIZE, NEWS_CATEGORIES } from '@/lib/constants';
import { newsCategoryLabel } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NewsCard } from '@/components/cards/NewsCard';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import type { NewsCategory } from '@/types/api';

export default function NewsPage() {
  const [filters, setFilters] = useState<NewsListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    category: '',
    tag: '',
    sourceName: '',
  });

  const query = useNewsList(filters);
  const update = (patch: Partial<NewsListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  const pagination = query.data?.pagination;

  return (
    <div>
      <PageHeading title="新聞" description="英文新聞來源的 AI 摘要、分類與標籤。" />

      <FilterBar>
        <Select
          label="分類"
          placeholder="全部分類"
          options={NEWS_CATEGORIES.map((c) => ({ label: newsCategoryLabel(c), value: c }))}
          value={filters.category ?? ''}
          onChange={(e) => update({ category: e.target.value as NewsCategory | '' })}
        />
        <Input
          label="標籤"
          placeholder="標籤名稱"
          value={filters.tag ?? ''}
          onChange={(e) => update({ tag: e.target.value })}
        />
        <Input
          label="來源"
          placeholder="來源名稱"
          value={filters.sourceName ?? ''}
          onChange={(e) => update({ sourceName: e.target.value })}
        />
      </FilterBar>

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => update({ page })}
            />
          )}
        </>
      )}
    </div>
  );
}
