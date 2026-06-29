// Minimal mock backend for E2E. Serves the 03 API contract on :3000 with the
// /api prefix so BOTH the Next server (getServerUser) and the browser hit it.
// Auth is cookie-based: login sets `wc_session=<role>`; /auth/me reads it.
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_API_PORT ?? 3000);

const users = {
  USER: { id: 'u-user', email: 'user@example.com', displayName: 'Normal User', role: 'USER', status: 'ACTIVE' },
  PREMIUM: { id: 'u-premium', email: 'premium@example.com', displayName: 'Premium User', role: 'PREMIUM', status: 'ACTIVE' },
  ADMIN: { id: 'u-admin', email: 'admin@example.com', displayName: 'Admin User', role: 'ADMIN', status: 'ACTIVE' },
};

const teams = [
  { id: 'team-fra', nameEn: 'France', nameZh: '法國', fifaCode: 'FRA', continent: 'UEFA', groupName: 'A', coachName: 'Deschamps', ratingTier: 'S', championScore: 88, attackScore: 90, midfieldScore: 85, defenseScore: 84, statusScore: 80, formScore: 82 },
  { id: 'team-arg', nameEn: 'Argentina', nameZh: '阿根廷', fifaCode: 'ARG', continent: 'CONMEBOL', groupName: 'B', coachName: 'Scaloni', ratingTier: 'S', championScore: 86, attackScore: 88, midfieldScore: 86, defenseScore: 80, statusScore: 83, formScore: 84 },
];

const players = [
  { id: 'player-mbappe', teamId: 'team-fra', team: teams[0], nameEn: 'Kylian Mbappe', nameZh: '姆巴佩', position: 'FW', clubName: 'Real Madrid', shirtNumber: 10, ratingTier: 'S', overallScore: 92, attackScore: 95, creativityScore: 88, techniqueScore: 90, defenseScore: 40, physicalScore: 88, formScore: 90, role: 'STARTER', injuryRiskLevel: 'LOW' },
  { id: 'player-messi', teamId: 'team-arg', team: teams[1], nameEn: 'Lionel Messi', nameZh: '梅西', position: 'FW', clubName: 'Inter Miami', shirtNumber: 10, ratingTier: 'S', overallScore: 91, attackScore: 90, creativityScore: 96, techniqueScore: 95, defenseScore: 35, physicalScore: 72, formScore: 85, role: 'STARTER', injuryRiskLevel: 'MEDIUM' },
];

const matches = [
  { id: 'match-1', homeTeam: teams[0], awayTeam: teams[1], stage: '小組賽', groupName: 'A', stadium: 'Lusail', kickoffAt: '2026-06-15T18:00:00.000Z', status: 'SCHEDULED', aiSummary: '頂級對決。' },
  { id: 'match-2', homeTeam: teams[1], awayTeam: teams[0], stage: '小組賽', groupName: 'A', kickoffAt: '2026-06-10T15:00:00.000Z', status: 'FINISHED', homeScore: 2, awayScore: 1, aiSummary: '逆轉取勝。' },
];

const news = [
  { id: 'news-1', sourceName: 'The Guardian', sourceUrl: 'https://example.com/n1', titleEn: 'France name strong squad', titleZh: '法國公布名單', summaryEn: 'Strong squad.', summaryZh: '實力堅強。', publishedAt: '2026-06-01T09:00:00.000Z', category: '陣容', tags: [{ id: 't1', name: 'France', type: 'TEAM' }], translationStatus: 'NONE' },
];

const champion = {
  runId: 'run-1', status: 'DONE', createdAt: '2026-06-01T00:00:00.000Z', completedAt: '2026-06-01T00:05:00.000Z',
  entries: [
    { id: 'e1', team: teams[0], rank: 1, championScore: 88, ratingTier: 'S', strengths: ['攻擊強'], risks: ['防線老化'], aiComment: '奪冠熱門。' },
    { id: 'e2', team: teams[1], rank: 2, championScore: 86, ratingTier: 'S', strengths: ['中場控制'], risks: ['體能'], aiComment: '經驗豐富。' },
  ],
  finalReport: null, nvidiaReport: null, qwenReport: null,
};

function ok(data, meta) {
  return JSON.stringify({ data, meta, error: null });
}
function paginated(items) {
  return ok(items, { pagination: { page: 1, pageSize: 20, total: items.length, totalPages: 1 } });
}
function errBody(code, message) {
  return JSON.stringify({ data: null, error: { code, message } });
}

function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3001',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extraHeaders,
  });
  res.end(body);
}

function roleFromCookie(req) {
  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(/wc_session=(USER|PREMIUM|ADMIN)/);
  return match ? match[1] : null;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method ?? 'GET';
  const path = pathname.replace(/^\/api/, '');

  if (method === 'OPTIONS') return send(res, 204, '');

  // ----- Auth -----
  if (path === '/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const email = String(body.email ?? '');
    const role = email.includes('admin') ? 'ADMIN' : email.includes('premium') ? 'PREMIUM' : 'USER';
    const redirectPath = role === 'ADMIN' ? '/admin/accounts' : '/matches';
    return send(res, 200, ok({ user: users[role], redirectPath }), {
      'Set-Cookie': `wc_session=${role}; Path=/; HttpOnly; SameSite=Lax`,
    });
  }
  if (path === '/auth/register' && method === 'POST') {
    return send(res, 200, ok(users.USER));
  }
  if (path === '/auth/logout' && method === 'POST') {
    return send(res, 200, ok({ success: true }), {
      'Set-Cookie': 'wc_session=; Path=/; HttpOnly; Max-Age=0',
    });
  }
  if (path === '/auth/me' && method === 'GET') {
    const role = roleFromCookie(req);
    if (!role) return send(res, 401, errBody('UNAUTHORIZED', '未登入'));
    return send(res, 200, ok(users[role]));
  }

  // ----- Public -----
  if (path === '/home/highlights') {
    return send(res, 200, ok({
      featuredMatches: matches,
      championSummary: champion.entries,
      featuredTeams: teams,
      featuredPlayers: players,
      newsHighlights: news,
    }));
  }

  // ----- Admin (ADMIN only) -----
  if (path.startsWith('/admin/')) {
    const role = roleFromCookie(req);
    if (role !== 'ADMIN') return send(res, 403, errBody('FORBIDDEN', '權限不足'));
    if (path === '/admin/users' && method === 'GET') {
      return send(res, 200, paginated([users.USER, users.PREMIUM, users.ADMIN]));
    }
    if (path === '/admin/users' && method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, ok({ ...users.USER, ...body, id: 'u-new' }));
    }
    if (/^\/admin\/users\/.+\/role$/.test(path) && method === 'PATCH') {
      const body = await readBody(req);
      return send(res, 200, ok({ ...users.USER, role: body.role }));
    }
    if (/^\/admin\/users\/.+$/.test(path) && method === 'DELETE') {
      return send(res, 200, ok({ success: true }));
    }
    if (path === '/admin/register-admin' && method === 'POST') {
      return send(res, 200, ok(users.ADMIN));
    }
    return send(res, 404, errBody('NOT_FOUND', 'not found'));
  }

  // ----- Authenticated app data (USER/PREMIUM) -----
  const role = roleFromCookie(req);
  if (!role || role === 'ADMIN') {
    return send(res, role === 'ADMIN' ? 403 : 401, errBody(role === 'ADMIN' ? 'FORBIDDEN' : 'UNAUTHORIZED', '無權限'));
  }

  if (path === '/users/me') return send(res, 200, ok(users[role]));
  if (path === '/users/me/favorites') return send(res, 200, ok({ teams: [], players: [] }));
  if (path.startsWith('/favorites/')) return send(res, 200, ok({ success: true }));

  if (path === '/matches') return send(res, 200, paginated(matches));
  if (/^\/matches\/[^/]+$/.test(path)) return send(res, 200, ok({ ...matches[0], events: [], keyPlayers: [] }));
  if (/^\/matches\/[^/]+\/(analysis|prediction|post-match-report)$/.test(path)) return send(res, 200, ok(null));

  if (path === '/teams') return send(res, 200, paginated(teams));
  if (/^\/teams\/[^/]+$/.test(path)) return send(res, 200, ok(teams[0]));
  if (/^\/teams\/[^/]+\/players$/.test(path)) return send(res, 200, ok(players));
  if (/^\/teams\/[^/]+\/matches$/.test(path)) return send(res, 200, ok(matches));

  if (path === '/players') return send(res, 200, paginated(players));
  if (/^\/players\/[^/]+$/.test(path)) return send(res, 200, ok(players[0]));

  if (path === '/news') return send(res, 200, paginated(news));
  if (/^\/news\/[^/]+$/.test(path)) return send(res, 200, ok(news[0]));

  if (path === '/champion-predictions/latest') return send(res, 200, ok(champion));

  return send(res, 404, errBody('NOT_FOUND', 'not found'));
});

server.listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT}/api`);
});
