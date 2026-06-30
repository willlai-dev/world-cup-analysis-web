'use client';

import { useParams } from 'next/navigation';
import { useNewsItem } from '@/features/news/use-news';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PremiumGate } from '@/components/auth/RoleGate';
import { DeepChatPlaceholder } from '@/components/ai/DeepChatPlaceholder';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { formatDateTime, newsCategoryLabel } from '@/lib/formatters';

export default function NewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const news = useNewsItem(newsId);

  if (news.isLoading) return <LoadingState />;
  if (news.isError) return <ErrorState error={news.error} onRetry={() => news.refetch()} />;
  if (!news.data) return <ErrorState />;

  const n = news.data;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{n.sourceName}</span>
            <span>{formatDateTime(n.publishedAt)}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{n.titleEn}</h1>
          {n.titleZh && <p className="text-lg text-slate-700">{n.titleZh}</p>}

          <div className="flex flex-wrap items-center gap-1.5">
            {n.category && <Badge tone="brand">{newsCategoryLabel(n.category)}</Badge>}
            {(n.tags ?? []).map((tag) => (
              <Badge key={tag.id} tone="neutral">
                {tag.name}
              </Badge>
            ))}
          </div>

          <a
            href={n.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            查看原文 →
          </a>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI 摘要</CardTitle>
        </CardHeader>
        <CardBody className="text-sm leading-relaxed text-slate-700">
          {n.summaryZh || n.summaryEn || n.contentSnippet || '目前沒有可顯示的摘要。'}
        </CardBody>
      </Card>

      {/* Translation is PREMIUM-only and wired in Phase 2; USER sees a can't-use notice. */}
      <PremiumGate feature="新聞翻譯">
        <Card data-testid="translation-panel">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>繁體中文翻譯</CardTitle>
            <Badge tone="premium">PREMIUM</Badge>
          </CardHeader>
          <CardBody className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {n.translatedContentZh ?? '使用 Qwen 翻譯新聞為繁體中文（Phase 2 開放）。'}
            </p>
            <Button variant="outline" size="sm" disabled title="Phase 2 開放">
              翻譯
            </Button>
          </CardBody>
        </Card>
      </PremiumGate>

      <DeepChatPlaceholder context={n.titleEn} />
    </div>
  );
}
