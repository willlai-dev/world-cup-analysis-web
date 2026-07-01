import { apiData } from '@/lib/api-client';
import type { ChatAnswer } from '@/types/api';

// POST /api/ai/chat — USER/PREMIUM only. Body is strictly { question } (backend
// ValidationPipe forbidNonWhitelisted: true). Degrades to PROGRAM_RULE on provider
// failure but still resolves (201); only 401/403/400/network surface as ApiError.
export function sendGeneralChat(question: string): Promise<ChatAnswer> {
  return apiData<ChatAnswer>('/ai/chat', { method: 'POST', body: { question } });
}
