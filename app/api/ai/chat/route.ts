import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/constants';

// Same as the translate Route Handler: bypasses the Next.js dev-server rewrite
// proxy's ~30-second socket timeout for AI chat calls (which can take 30–90 s).
const CHAT_TIMEOUT_MS = 120_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cookie = request.headers.get('cookie') ?? '';

  let body: string;
  try {
    body = await request.text();
  } catch {
    body = '';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: body || undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        {
          data: null,
          error: { code: 'GATEWAY_TIMEOUT', message: 'AI 回應逾時，請稍後再試。' },
        },
        { status: 504 },
      );
    }
    return NextResponse.json(
      {
        data: null,
        error: { code: 'PROXY_ERROR', message: 'AI 服務暫時無法使用，請稍後再試。' },
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
