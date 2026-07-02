import { apiData } from '@/lib/api-client';
import type { ChatAnswer, ChatMessage } from '@/types/api';

// Backend only consumes the last 6 messages (≈3 Q&A pairs); trim here to save
// bandwidth. Backend re-trims regardless.
const MAX_HISTORY_MESSAGES = 6;

// POST /api/ai/chat — USER/PREMIUM only (ADMIN → 403). Multi-turn: pass prior
// turns as `history` (old→new, {role,content}); `question` is this turn only and
// must NOT be included in history. The backend is stateless, so the client
// replays recent turns. Empty/blank content is dropped (the backend ignores it).
// Degrades to PROGRAM_RULE on provider failure but still resolves (201); only
// 401/403/400/network surface as ApiError.
export function sendGeneralChat(
  question: string,
  history: ChatMessage[] = [],
): Promise<ChatAnswer> {
  const trimmed = history
    .filter((message) => message.content.trim().length > 0)
    .slice(-MAX_HISTORY_MESSAGES);

  return apiData<ChatAnswer>('/ai/chat', {
    method: 'POST',
    body: trimmed.length > 0 ? { question, history: trimmed } : { question },
  });
}
