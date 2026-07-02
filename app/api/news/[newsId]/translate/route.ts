import { type NextRequest, type NextResponse } from 'next/server';
import { NEWS_TRANSLATE_TIMEOUT_MS, proxyAiPost } from '@/lib/ai-proxy';

// POST /api/news/:newsId/translate via the shared long-timeout proxy: the AI
// translation call (Qwen) can take 30–90 s (longer for a long article), well
// past the dev-server rewrite proxy's ~30-second socket timeout. Use the
// dedicated 4-minute budget and a matching route-segment maxDuration so neither
// the proxy nor the platform aborts before the translation finishes. Body is
// empty; the proxy forwards none.
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ newsId: string }> },
): Promise<NextResponse> {
  const { newsId } = await params;
  return proxyAiPost(request, `/news/${newsId}/translate`, NEWS_TRANSLATE_TIMEOUT_MS);
}
