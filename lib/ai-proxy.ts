import { type NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/constants';

// Shared long-timeout proxy for AI POST endpoints. The Next.js dev-server rewrite
// proxy has a ~30-second socket timeout, shorter than real NVIDIA/Qwen calls
// (30–90 s each). These Route Handlers bypass that proxy with an explicit
// timeout so the full response reaches the client, while keeping the
// {data,meta,error} envelope intact (incl. 429 quota).
const AI_PROXY_TIMEOUT_MS = 120_000;

// Champion recalculate runs three sequential AI legs (A/B/final), each up to
// ~90 s, so it needs a much longer budget than the single-call endpoints
// (worst case ~270 s). Fixed at 5 minutes for headroom. Note: this only bounds
// how long *this proxy* waits for the backend's response — the backend keeps
// processing (and persists the run) to completion regardless of whether this
// request is still attached, so the user can safely navigate away.
export const CHAMPION_RECALCULATE_TIMEOUT_MS = 5 * 60 * 1000;

// News translation (Qwen) on a long article can run well past the 120 s single-
// call default — give it a dedicated 4-minute budget so the full translation
// reaches the client instead of the proxy aborting mid-generation.
export const NEWS_TRANSLATE_TIMEOUT_MS = 4 * 60 * 1000;

export async function proxyAiPost(
  request: NextRequest,
  backendPath: string,
  timeoutMs: number = AI_PROXY_TIMEOUT_MS,
): Promise<NextResponse> {
  const cookie = request.headers.get('cookie') ?? '';

  let body: string;
  try {
    body = await request.text();
  } catch {
    body = '';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BACKEND_API_URL}${backendPath}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // Only send a JSON content-type when there is actually a body — some
        // fetch/HTTP implementations reject "content-type: application/json"
        // paired with an empty body ("Body cannot be empty when content-type
        // is set to 'application/json'"). Several callers (recalculate,
        // translate, deep-chat with no payload) legitimately POST with no body.
        ...(body ? { 'content-type': 'application/json' } : {}),
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
        { data: null, error: { code: 'GATEWAY_TIMEOUT', message: 'AI 回應逾時，請稍後再試。' } },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { data: null, error: { code: 'PROXY_ERROR', message: 'AI 服務暫時無法使用，請稍後再試。' } },
      { status: 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
