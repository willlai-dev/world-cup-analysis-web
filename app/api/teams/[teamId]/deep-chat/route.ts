import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only deep chat for a team. Long-timeout proxy (see lib/ai-proxy).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const { teamId } = await params;
  return proxyAiPost(request, `/teams/${teamId}/deep-chat`);
}
