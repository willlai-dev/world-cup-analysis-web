import { quotaDetails, quotaResetHint } from '@/lib/ai';
import { formatDateTime } from '@/lib/formatters';

// Renders a friendly quota-exceeded notice for a 429 AI_QUOTA_EXCEEDED error
// (Phase 3 §1). Shows the backend's Chinese message and a resetAt-derived hint.
// Reads limit/used/resetAt from error.details — never hardcodes the numbers.
export function AiQuotaNotice({ error, className }: { error: unknown; className?: string }) {
  const details = quotaDetails(error);
  if (!details) return null;

  const hint = quotaResetHint(details.resetAt);
  const message = error instanceof Error ? error.message : '今日 AI 額度已用完，請稍後再試。';

  return (
    <div
      data-testid="ai-quota-notice"
      className={`rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 ${className ?? ''}`}
    >
      <p className="font-medium">已達 AI 使用額度上限</p>
      <p className="mt-1">{message}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-700">
        {details.limit > 0 && (
          <span>
            已使用 {details.used}/{details.limit}
          </span>
        )}
        {hint && <span>{hint}</span>}
        <span>恢復時間 {formatDateTime(details.resetAt)}</span>
      </div>
    </div>
  );
}
