import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/formatters';
import type { NewsSummary } from '@/types/api';

export function NewsCard({ news }: { news: NewsSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{news.sourceName}</span>
          <span>{formatDate(news.publishedAt)}</span>
        </div>

        <Link href={routes.newsItem(news.id)} className="font-semibold text-slate-900 hover:text-brand-700">
          {news.titleEn}
        </Link>

        {(news.summaryZh || news.summaryEn) && (
          <p className="line-clamp-2 text-sm text-slate-600">
            {news.summaryZh || news.summaryEn}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {news.category && <Badge tone="brand">{news.category}</Badge>}
          {(news.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag.id} tone="neutral">
              {tag.name}
            </Badge>
          ))}
        </div>

        <Link href={routes.newsItem(news.id)} className="text-sm font-medium text-brand-700 hover:underline">
          查看詳情 →
        </Link>
      </CardBody>
    </Card>
  );
}
