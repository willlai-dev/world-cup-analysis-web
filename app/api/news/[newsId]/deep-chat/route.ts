import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only deep chat for a news article. Long-timeout proxy (see lib/ai-proxy).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ newsId: string }> },
): Promise<NextResponse> {
  const { newsId } = await params;
  return proxyAiPost(request, `/news/${newsId}/deep-chat`);
}
