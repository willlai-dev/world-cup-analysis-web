'use client';

import { useParams } from 'next/navigation';
import { useNewsAnalysis, useNewsItem } from '@/features/news/use-news';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NewsTranslationPanel } from '@/components/ai/NewsTranslationPanel';
import { NewsAnalysisPanel } from '@/components/ai/NewsAnalysisPanel';
import { DeepChat } from '@/components/ai/DeepChat';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { NEWS_TAG_TONES } from '@/lib/constants';
import { formatDateTime, newsCategoryLabel } from '@/lib/formatters';

export default function NewsDetailPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const news = useNewsItem(newsId);
  const analysis = useNewsAnalysis(newsId);

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
              <Badge key={tag.id} tone={NEWS_TAG_TONES[tag.type] ?? 'neutral'}>
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

      {/* §4 impact analysis: hidden until generated (null-tolerant). */}
      <NewsAnalysisPanel report={analysis.data} isLoading={analysis.isLoading} />

      {/* Translation is PREMIUM-only; USER sees a can't-use notice via PremiumGate. */}
      <NewsTranslationPanel news={n} />

      <DeepChat endpoint={`/news/${n.id}/deep-chat`} context={n.titleEn} />
    </div>
  );
}
