import { type NextRequest, type NextResponse } from 'next/server';
import { CHAMPION_RECALCULATE_TIMEOUT_MS, proxyAiPost } from '@/lib/ai-proxy';

// PREMIUM-only champion recalculate. Runs three AI legs (A/B/final) so it is the
// longest AI call — must bypass the dev-server rewrite proxy's ~30s timeout.
// Also needs a longer proxy-side abort timeout (see CHAMPION_RECALCULATE_TIMEOUT_MS)
// and a matching route-segment maxDuration so the platform doesn't kill the
// function before the three legs finish.
export const maxDuration = 300;

export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyAiPost(request, '/champion-predictions/recalculate', CHAMPION_RECALCULATE_TIMEOUT_MS);
}
