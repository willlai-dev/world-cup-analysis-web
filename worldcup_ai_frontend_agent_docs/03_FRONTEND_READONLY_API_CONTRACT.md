# 03 FRONTEND READONLY API CONTRACT

This file is the only backend contract the Frontend Agent should rely on. Do not implement NestJS, Prisma, database, jobs, data sources, NVIDIA, or Qwen. If the backend is unavailable, mock these endpoints without changing endpoint names or response shapes.

## Base URL

Use:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000/api
```

All requests must go to the backend API. The frontend must not call third-party APIs directly.

## Response Envelope

All successful responses use this shape:

```ts
export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
  error: null;
};
```

All errors use this shape:

```ts
export type ApiError = {
  data: null;
  meta?: Record<string, unknown>;
  error: { code: string; message: string; details?: unknown };
};
```

Paginated list endpoints return the array in `data` and pagination in `meta.pagination`:

```ts
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
```

Example:

```ts
type PaginatedApiSuccess<T> = ApiSuccess<T[]> & {
  meta: { pagination: PaginationMeta };
};
```

## Auth / Cookie Contract

- Use `credentials: 'include'` in the frontend API client.
- Auth state is loaded by `GET /auth/me`.
- If `/auth/me` returns 401, treat the user as `GUEST` locally.
- Do not store access tokens in localStorage.
- Use backend `redirectPath` after login.

## Shared Types

```ts
export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
};

export type TeamSummary = {
  id: string;
  nameEn: string;
  nameZh?: string | null;
  fifaCode?: string | null;
  continent?: string | null;
  groupName?: string | null;
  coachName?: string | null;
  flagUrl?: string | null;
  ratingTier?: 'S' | 'A' | 'B' | 'C' | 'UNKNOWN';
  championScore?: number | null;
  formScore?: number | null;
  attackScore?: number | null;
  midfieldScore?: number | null;
  defenseScore?: number | null;
  statusScore?: number | null;
};

export type PlayerSummary = {
  id: string;
  teamId: string;
  team?: TeamSummary;
  nameEn: string;
  nameZh?: string | null;
  position: 'GK' | 'DF' | 'MF' | 'FW' | 'UNKNOWN';
  clubName?: string | null;
  shirtNumber?: number | null;
  ratingTier?: 'S' | 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C' | 'UNKNOWN';
  overallScore?: number | null;
  attackScore?: number | null;
  creativityScore?: number | null;
  techniqueScore?: number | null;
  defenseScore?: number | null;
  physicalScore?: number | null;
  formScore?: number | null;
  role?: 'STARTER' | 'ROTATION' | 'SUBSTITUTE' | 'IMPACT_PLAYER' | 'UNKNOWN';
  injuryRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
};

export type MatchSummary = {
  id: string;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  stage: string;
  groupName?: string | null;
  stadium?: string | null;
  kickoffAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeScore?: number | null;
  awayScore?: number | null;
  sourceUpdatedAt?: string | null;
  aiSummary?: string | null;
};

export type AiReport = {
  id: string;
  entityType: string;
  entityId?: string | null;
  reportType: string;
  provider: 'NVIDIA' | 'QWEN' | 'PROGRAM_RULE';
  model?: string | null;
  language: string;
  title?: string | null;
  content?: string | null;
  structuredJson?: unknown;
  confidenceScore?: number | null;
  status: 'PENDING' | 'DONE' | 'FAILED';
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MatchPrediction = {
  matchId: string;
  homeWinProbability?: number | null;
  drawProbability?: number | null;
  awayWinProbability?: number | null;
  keyFactors: string[];
  riskNotes: string[];
  report?: AiReport | null;
  sourceUpdatedAt?: string | null;
};

export type NewsSummary = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  titleEn: string;
  titleZh?: string | null;
  summaryEn?: string | null;
  summaryZh?: string | null;
  publishedAt?: string | null;
  category?: string | null;
  tags?: { id: string; name: string; type: string }[];
  translationStatus?: 'NONE' | 'PENDING' | 'DONE' | 'FAILED';
};

export type ChampionPredictionEntry = {
  id: string;
  team: TeamSummary;
  rank: number;
  championScore: number;
  ratingTier?: 'S' | 'A' | 'B' | 'C' | 'UNKNOWN';
  probabilityText?: string | null;
  strengths: string[];
  risks: string[];
  aiComment?: string | null;
};

export type ChampionPredictionResponse = {
  runId: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  createdAt: string;
  completedAt?: string | null;
  entries: ChampionPredictionEntry[];
  finalReport?: AiReport | null;
  nvidiaReport?: AiReport | null;
  qwenReport?: AiReport | null;
};

export type ChatAnswer = {
  answer: string;
  provider: 'NVIDIA' | 'QWEN' | 'PROGRAM_RULE';
  model?: string | null;
  sourceUpdatedAt?: string | null;
};
```

## Auth APIs

```txt
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### POST /auth/register

Request:

```ts
type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};
```

Response:

```ts
type RegisterResponse = User;
```

### POST /auth/login

Request:

```ts
type LoginRequest = { email: string; password: string };
```

Response:

```ts
type LoginResponse = {
  user: User;
  redirectPath: '/matches' | '/admin/accounts';
};
```

### GET /auth/me

Response:

```ts
type MeResponse = User;
```

## Required API Endpoints

### Home

```txt
GET /home/highlights
```

Public. Used by `/`.

Response:

```ts
type HomeHighlightsResponse = {
  featuredMatches: MatchSummary[];
  championSummary: ChampionPredictionEntry[];
  featuredTeams: TeamSummary[];
  featuredPlayers: PlayerSummary[];
  newsHighlights: NewsSummary[];
};
```

### Admin

```txt
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/:userId/role
DELETE /admin/users/:userId
POST   /admin/register-admin
```

Admin-only. A USER/PREMIUM should receive 403.

`GET /admin/users` query: `page`, `pageSize`, `search`, `role`, `status`.

`POST /admin/users` request:

```ts
type AdminCreateUserRequest = {
  email: string;
  password: string;
  displayName: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
};
```

`PATCH /admin/users/:userId/role` request:

```ts
type AdminUpdateRoleRequest = { role: 'USER' | 'PREMIUM' | 'ADMIN' };
```

### Users / Profile

```txt
GET   /users/me
PATCH /users/me
GET   /users/me/favorites
```

`PATCH /users/me` request:

```ts
type UpdateMeRequest = {
  displayName?: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
};
```

`GET /users/me/favorites` response:

```ts
type FavoritesResponse = {
  teams: TeamSummary[];
  players: PlayerSummary[];
};
```

### Matches

```txt
GET /matches
GET /matches/today
GET /matches/:matchId
GET /matches/:matchId/analysis
GET /matches/:matchId/prediction
GET /matches/:matchId/post-match-report
POST /matches/:matchId/deep-chat
```

`GET /matches` query: `page`, `pageSize`, `status`, `stage`, `dateFrom`, `dateTo`, `teamId`, `groupName`.

- List endpoints return `MatchSummary[]`.
- `GET /matches/:matchId` returns `MatchSummary` plus optional `events`, `keyPlayers`, and `reports` fields.
- `GET /matches/:matchId/analysis` returns `AiReport | null`.
- `GET /matches/:matchId/prediction` returns `MatchPrediction | null`.
- `GET /matches/:matchId/post-match-report` returns `AiReport | null`.
- `POST /matches/:matchId/deep-chat` is PREMIUM only and returns `ChatAnswer`.

### Teams

```txt
GET /teams
GET /teams/:teamId
GET /teams/:teamId/players
GET /teams/:teamId/matches
GET /teams/:teamId/analysis
POST /teams/:teamId/deep-chat
```

Query: `page`, `pageSize`, `search`, `continent`, `ratingTier`, `sortBy`, `sortOrder`.

- List endpoints return `TeamSummary[]`.
- `GET /teams/:teamId` returns `TeamSummary` plus optional `analysis`, `recentMatches`, and `keyPlayers` fields.
- `GET /teams/:teamId/players` returns `PlayerSummary[]`.
- `GET /teams/:teamId/matches` returns `MatchSummary[]`.
- `GET /teams/:teamId/analysis` returns `AiReport | null`.
- `POST /teams/:teamId/deep-chat` is PREMIUM only and returns `ChatAnswer`.

### Players

```txt
GET /players
GET /players/:playerId
GET /players/:playerId/rating
GET /players/:playerId/analysis
POST /players/:playerId/deep-chat
```

Query: `page`, `pageSize`, `search`, `teamId`, `position`, `ratingTier`, `sortBy`, `sortOrder`.

- List endpoints return `PlayerSummary[]`.
- `GET /players/:playerId` returns `PlayerSummary` plus optional `relatedNews` and `analysis` fields.
- `GET /players/:playerId/rating` returns `PlayerSummary` ability/rating fields.
- `GET /players/:playerId/analysis` returns `AiReport | null`.
- `POST /players/:playerId/deep-chat` is PREMIUM only and returns `ChatAnswer`.

### Favorites

```txt
GET    /users/me/favorites
POST   /favorites/teams/:teamId
DELETE /favorites/teams/:teamId
POST   /favorites/players/:playerId
DELETE /favorites/players/:playerId
```

Favorite create/delete responses should return the updated `FavoritesResponse` or `{ success: true }`. The frontend must handle both.

### Champion Predictions

```txt
GET  /champion-predictions
GET  /champion-predictions/latest
POST /champion-predictions/recalculate
POST /champion-predictions/deep-chat
```

- `GET /champion-predictions` and `GET /champion-predictions/latest` return `ChampionPredictionResponse`.
- `POST /champion-predictions/recalculate` is PREMIUM only and returns `{ runId: string; status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' }`.
- `POST /champion-predictions/deep-chat` is PREMIUM only and returns `ChatAnswer`.

### News

```txt
GET  /news
GET  /news/:newsId
POST /news/:newsId/translate
POST /news/:newsId/deep-chat
```

Query: `page`, `pageSize`, `category`, `tag`, `teamId`, `playerId`, `sourceName`, `dateFrom`, `dateTo`.

- `GET /news` returns `NewsSummary[]`.
- `GET /news/:newsId` returns `NewsSummary` plus optional `contentSnippet`, `translatedContentZh`, and `relatedEntities` fields.
- `POST /news/:newsId/translate` is PREMIUM only and returns `{ translatedContentZh: string; provider: 'QWEN' | 'NVIDIA'; model?: string | null }`.
- `POST /news/:newsId/deep-chat` is PREMIUM only and returns `ChatAnswer`.

### General AI Chat

```txt
POST /ai/chat
```

USER/PREMIUM only. Admin must not see the UI entry.

Request:

```ts
type GeneralChatRequest = { question: string };
```

Response: `ChatAnswer`.

## Frontend Must Not Call

Frontend product UI must not call these backend-only endpoints:

```txt
/jobs/*
/health
/health/db
```

They may be used only in backend health/deployment checks, not in user-facing UI.

## Frontend Mocking Rules

If backend is unavailable:

- Create local mock data inside frontend test/mocks only.
- Do not change endpoint names.
- Do not bypass role rules in UI tests.
- Mock 401 and 403 states explicitly.
- Mock `ApiSuccess<T>` and `ApiError` envelopes exactly.
