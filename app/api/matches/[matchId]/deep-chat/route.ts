import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only deep chat for a match. Long-timeout proxy (see lib/ai-proxy).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const { matchId } = await params;
  return proxyAiPost(request, `/matches/${matchId}/deep-chat`);
}
