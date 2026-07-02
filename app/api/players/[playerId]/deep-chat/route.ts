import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only deep chat for a player. Long-timeout proxy (see lib/ai-proxy).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> },
): Promise<NextResponse> {
  const { playerId } = await params;
  return proxyAiPost(request, `/players/${playerId}/deep-chat`);
}
