import { apiData } from '@/lib/api-client';
import type { AiUsageQuery, AiUsageStats } from '@/types/api';

// GET /admin/ai-usage — ADMIN only (Phase 3 §6). Omitting from/to defaults to the
// last 7 days on the backend. `taskType` optionally narrows the window.
export function fetchAiUsage(
  params: AiUsageQuery,
  signal?: AbortSignal,
): Promise<AiUsageStats> {
  return apiData<AiUsageStats>('/admin/ai-usage', {
    query: {
      from: params.from || undefined,
      to: params.to || undefined,
      taskType: params.taskType || undefined,
    },
    signal,
  });
}
