import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/constants';

// The rewrite proxy in the Next.js dev server has a ~30-second socket timeout,
// which is shorter than the AI translation call (Qwen can take 30–90 s).
// This Route Handler bypasses that proxy and sets an explicit 120-second timeout
// so the full AI response can reach the client.
const TRANSLATE_TIMEOUT_MS = 120_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ newsId: string }> },
): Promise<NextResponse> {
  const { newsId } = await params;
  const cookie = request.headers.get('cookie') ?? '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_API_URL}/news/${newsId}/translate`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...(cookie ? { cookie } : {}),
      },
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
          error: { code: 'GATEWAY_TIMEOUT', message: '翻譯請求逾時，請稍後再試。' },
        },
        { status: 504 },
      );
    }
    return NextResponse.json(
      {
        data: null,
        error: { code: 'PROXY_ERROR', message: '翻譯服務暫時無法使用，請稍後再試。' },
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
