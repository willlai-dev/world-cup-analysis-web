import { apiData } from '@/lib/api-client';
import type { ChatAnswer } from '@/types/api';

// POST /{matches|teams|players|news}/:id/deep-chat and /champion-predictions/deep-chat
// — all PREMIUM-only, all take just `{ question }` (no history; the backend
// grounds the answer in that entity's data). `endpoint` is the /api-relative path
// (e.g. "/matches/abc/deep-chat"), which routes through the same-origin proxy.
// Degrades to a PROGRAM_RULE answer on provider failure (still resolves);
// 401/403/400/429/network surface as ApiError for the caller to handle.
export function sendDeepChat(endpoint: string, question: string): Promise<ChatAnswer> {
  return apiData<ChatAnswer>(endpoint, {
    method: 'POST',
    body: { question },
  });
}
