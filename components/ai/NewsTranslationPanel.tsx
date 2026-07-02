'use client';

import { useState } from 'react';
import { PremiumGate } from '@/components/auth/RoleGate';
import { AiQuotaNotice } from '@/components/ai/AiQuotaNotice';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslateNews } from '@/features/news/use-news';
import { aiErrorMessage, isQuotaError } from '@/lib/ai';
import { COPY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { NewsDetail } from '@/types/api';

// PREMIUM-only news translation. POST /news/:id/translate returns the full updated
// detail; the mutation seeds the cache so `news` re-renders with the new translation.
export function NewsTranslationPanel({ news }: { news: NewsDetail }) {
  const translate = useTranslateNews(news.id);
  const [showOriginal, setShowOriginal] = useState(false);

  // Prefer the freshly returned detail so the panel reflects the result even
  // before the parent re-renders from the seeded query cache.
  const current = translate.data ?? news;
  const hasTranslation =
    current.translationStatus === 'DONE' && !!current.translatedContentZh?.trim();
  const serverFailed = current.translationStatus === 'FAILED';
  const serverPending = current.translationStatus === 'PENDING';

  const buttonLabel = translate.isPending
    ? '翻譯中…'
    : hasTranslation
      ? '重新翻譯'
      : serverFailed || translate.isError
        ? '重試'
        : '翻譯';

  return (
    <PremiumGate feature="新聞翻譯">
      <Card data-testid="translation-panel">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>繁體中文翻譯</CardTitle>
          <Badge tone="premium">PREMIUM</Badge>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {translate.isPending || serverPending ? (
            <TranslatingIndicator />
          ) : translate.isError ? (
            isQuotaError(translate.error) ? (
              <AiQuotaNotice error={translate.error} />
            ) : (
              <p className="text-sm text-red-600">
                {aiErrorMessage(translate.error, COPY.translateFailed)}
              </p>
            )
          ) : hasTranslation ? (
            <div className="flex flex-col gap-2">
              {current.contentSnippet && (
                <div className="flex gap-1" role="tablist" aria-label="原文譯文切換">
                  <ToggleButton active={!showOriginal} onClick={() => setShowOriginal(false)}>
                    看譯文
                  </ToggleButton>
                  <ToggleButton active={showOriginal} onClick={() => setShowOriginal(true)}>
                    看原文
                  </ToggleButton>
                </div>
              )}
              <p
                data-testid={showOriginal ? 'original-content' : 'translated-content'}
                className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
              >
                {showOriginal ? current.contentSnippet : current.translatedContentZh}
              </p>
            </div>
          ) : serverFailed ? (
            <p className="text-sm text-red-600">{COPY.translateFailed}</p>
          ) : (
            <p className="text-sm text-slate-500">{COPY.translatePrompt}</p>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              isLoading={translate.isPending}
              onClick={() => translate.mutate()}
            >
              {buttonLabel}
            </Button>
          </div>
        </CardBody>
      </Card>
    </PremiumGate>
  );
}

// Translation can run 30–90 s (longer for a long article), so give it a clear,
// animated "working" state: a spinner with the pending copy, shimmering
// placeholder lines standing in for the incoming text, and a hint that it may
// take a while. role="status" keeps it announced to assistive tech.
function TranslatingIndicator() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span>{COPY.translatePending}</span>
      </div>
      <div className="flex flex-col gap-2" aria-hidden>
        <span className="h-3.5 w-full animate-pulse rounded bg-slate-200/80" />
        <span className="h-3.5 w-11/12 animate-pulse rounded bg-slate-200/80 [animation-delay:150ms]" />
        <span className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200/80 [animation-delay:300ms]" />
      </div>
      <p className="text-xs text-slate-400">翻譯需要一些時間，請耐心稍候，勿關閉此頁面。</p>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
        active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  );
}
