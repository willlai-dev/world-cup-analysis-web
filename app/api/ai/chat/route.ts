import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// POST /api/ai/chat via the shared long-timeout proxy (see lib/ai-proxy): bypasses
// the Next.js dev-server rewrite proxy's ~30-second socket timeout for AI chat
// calls (which can take 30–90 s).
export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyAiPost(request, '/ai/chat');
}
