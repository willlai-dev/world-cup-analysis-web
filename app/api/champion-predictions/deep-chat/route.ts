import { type NextRequest, type NextResponse } from 'next/server';
import { proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only deep chat for the champion prediction. Long-timeout proxy.
export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyAiPost(request, '/champion-predictions/deep-chat');
}
