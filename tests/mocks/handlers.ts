import { http, HttpResponse } from 'msw';
import {
  championFixture,
  championWithDivergenceFixture,
  homeHighlightsFixture,
  matchFixtures,
  matchPredictionFixture,
  meFixture,
  newsFixtures,
  playerFixtures,
  playerRatingReportFixture,
  teamFixtures,
  userFixtures,
} from '@/tests/mocks/fixtures';

// Browser-side api-client resolves to the same-origin proxy; in jsdom that is
// http://localhost:3001/api (see vitest.config.ts environmentOptions).
const API = 'http://localhost:3001/api';

function ok<T>(data: T, meta?: Record<string, unknown>) {
  return HttpResponse.json({ data, meta, error: null });
}

function fail(status: number, code: string, message: string) {
  return HttpResponse.json({ data: null, error: { code, message } }, { status });
}

function paginated<T>(items: T[]) {
  return ok(items, {
    pagination: { page: 1, pageSize: 20, total: items.length, totalPages: 1 },
  });
}

// Default handlers represent an authenticated USER. Individual tests can override
// (e.g. server.use(...)) to exercise 401/403/PREMIUM/ADMIN paths.
export const handlers = [
  http.get(`${API}/auth/me`, () => ok(userFixtures.user)),

  http.get(`${API}/home/highlights`, () => ok(homeHighlightsFixture)),

  http.get(`${API}/matches`, () => paginated(matchFixtures)),
  http.get(`${API}/matches/:id`, () => ok({ ...matchFixtures[0], events: [], keyPlayers: [] })),
  http.get(`${API}/matches/:id/analysis`, () => ok(null)),
  http.get(`${API}/matches/:id/prediction`, () => ok(matchPredictionFixture)),
  http.get(`${API}/matches/:id/post-match-report`, () => ok(null)),

  http.get(`${API}/teams`, () => paginated(teamFixtures)),
  http.get(`${API}/teams/:id`, () => ok(teamFixtures[0])),
  http.get(`${API}/teams/:id/players`, () => ok(playerFixtures)),
  http.get(`${API}/teams/:id/matches`, () => ok(matchFixtures)),
  http.get(`${API}/teams/:id/analysis`, () => ok(null)),

  http.get(`${API}/players`, () => paginated(playerFixtures)),
  http.get(`${API}/players/:id`, () => ok(playerFixtures[0])),
  http.get(`${API}/players/:id/analysis`, () => ok(null)),
  http.get(`${API}/players/:id/rating`, () => ok(playerRatingReportFixture)),
  // Phase 3 §2 deep-chat — PREMIUM; defaults to a simple grounded answer.
  http.post(`${API}/players/:id/deep-chat`, () => ok(deepChatAnswer('球員'))),
  http.post(`${API}/teams/:id/deep-chat`, () => ok(deepChatAnswer('球隊'))),
  http.post(`${API}/matches/:id/deep-chat`, () => ok(deepChatAnswer('賽事'))),

  http.get(`${API}/news`, () => paginated(newsFixtures)),
  http.get(`${API}/news/:id`, () => ok(newsFixtures[0])),
  // Phase 3 §4 impact analysis — null until generated.
  http.get(`${API}/news/:id/analysis`, () => ok(null)),
  http.post(`${API}/news/:id/deep-chat`, () => ok(deepChatAnswer('新聞'))),
  http.post(`${API}/news/:id/translate`, () =>
    ok({
      ...newsFixtures[0],
      titleZh: '【譯】France name strong squad',
      contentSnippet: 'snippet',
      translatedContentZh: '這是翻譯後的繁體中文內容。',
      language: 'en',
      fetchedAt: '2026-06-01T09:00:00.000Z',
      translationStatus: 'DONE',
    }),
  ),

  // POST /ai/chat → ChatAnswerDto. Echoes the question so tests can assert on it,
  // and encodes the received history length into `model` for multi-turn tests.
  http.post(`${API}/ai/chat`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      question?: string;
      history?: unknown[];
    };
    const historyLength = Array.isArray(body.history) ? body.history.length : 0;
    return ok({
      answer: `模擬回答：${body.question ?? ''}`,
      provider: 'NVIDIA',
      model: `mock-model:history=${historyLength}`,
      sourceUpdatedAt: '2026-06-01T00:00:00.000Z',
    });
  }),

  http.get(`${API}/champion-predictions/latest`, () => ok(championFixture)),
  http.post(`${API}/champion-predictions/recalculate`, () => ok(championWithDivergenceFixture)),
  http.post(`${API}/champion-predictions/deep-chat`, () => ok(deepChatAnswer('冠軍預測'))),

  http.get(`${API}/users/me`, () => ok(meFixture)),
  http.get(`${API}/users/me/favorites`, () => ok({ teams: [], players: [] })),

  // Admin endpoints default to 403 for the default USER session.
  http.get(`${API}/admin/users`, () => fail(403, 'FORBIDDEN', '權限不足')),
  http.get(`${API}/admin/ai-usage`, () => fail(403, 'FORBIDDEN', '權限不足')),
  http.get(`${API}/admin/jobs/runs`, () => fail(403, 'FORBIDDEN', '權限不足')),
];

// A deterministic deep-chat answer for a given entity scope.
function deepChatAnswer(scope: string) {
  return {
    answer: `模擬深層回答（${scope}）`,
    provider: 'NVIDIA' as const,
    model: 'mock-deep',
    sourceUpdatedAt: '2026-06-01T00:00:00.000Z',
  };
}

export { ok, fail, paginated, API };
