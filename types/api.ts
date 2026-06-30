// Shared API types — mirrors docs/READONLY_API_CONTRACT.md (backend Phase 1, actual).
// Do not diverge from the backend contract; do not add speculative request fields
// (backend ValidationPipe uses forbidNonWhitelisted: true → extra fields 400).

// ----- Envelope -----

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
  error: null;
};

export type ApiErrorBody = {
  data: null;
  meta?: Record<string, unknown>;
  error: { code: string; message: string; details?: unknown };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedApiSuccess<T> = ApiSuccess<T[]> & {
  meta: { pagination: PaginationMeta };
};

// ----- Enums (from contract section 4) -----

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type LocalRole = 'GUEST' | UserRole;
export type UserStatus = 'ACTIVE' | 'DISABLED';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type MatchStage =
  | 'GROUP'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL'
  | 'UNKNOWN';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW' | 'UNKNOWN';
export type PlayerRatingTier = 'S' | 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C' | 'UNKNOWN';
export type TeamRatingTier = 'S' | 'A' | 'B' | 'C' | 'UNKNOWN';
export type PlayerRole = 'STARTER' | 'ROTATION' | 'SUBSTITUTE' | 'IMPACT_PLAYER' | 'UNKNOWN';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type NewsCategory =
  | 'MATCH'
  | 'PLAYER'
  | 'INJURY'
  | 'TRANSFER'
  | 'TEAM'
  | 'TACTIC'
  | 'CONTROVERSY'
  | 'TOURNAMENT'
  | 'OTHER';
export type NewsTagType =
  | 'TEAM'
  | 'PLAYER'
  | 'MATCH'
  | 'TOPIC'
  | 'INJURY'
  | 'TACTIC'
  | 'CONTROVERSY'
  | 'TRANSFER'
  | 'OTHER';
export type TranslationStatus = 'NONE' | 'PENDING' | 'DONE' | 'FAILED';
export type AiProvider = 'NVIDIA' | 'QWEN' | 'PROGRAM_RULE';
export type AiReportStatus = 'PENDING' | 'DONE' | 'FAILED';
export type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

// ----- User / Profile -----

// UserDto — exactly what /auth/me and admin endpoints return.
export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  // NOTE: backend UserDto does NOT include createdAt today. Kept optional and
  // null-safe so the admin table column degrades to "—" rather than depending on it.
  createdAt?: string | null;
};

export type UserProfile = {
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

// MeDto — returned by GET/PATCH /users/me. Profile is nested (or null).
export type MeDto = User & {
  profile: UserProfile | null;
};

// ----- Domain entities -----

export type TeamSummary = {
  id: string;
  nameEn: string;
  nameZh?: string | null;
  fifaCode?: string | null;
  continent?: string | null;
  groupName?: string | null;
  coachName?: string | null;
  flagUrl?: string | null;
  worldRanking?: number | null;
  ratingTier?: TeamRatingTier;
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
  // Present on /players, /players/:id, favorites, home; ABSENT on /teams/:id/players.
  team?: TeamSummary;
  nameEn: string;
  nameZh?: string | null;
  position: PlayerPosition;
  clubName?: string | null;
  shirtNumber?: number | null;
  ratingTier?: PlayerRatingTier;
  overallScore?: number | null;
  attackScore?: number | null;
  creativityScore?: number | null;
  techniqueScore?: number | null;
  defenseScore?: number | null;
  physicalScore?: number | null;
  formScore?: number | null;
  role?: PlayerRole;
  injuryRiskLevel?: RiskLevel;
};

export type MatchSummary = {
  id: string;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  stage: MatchStage;
  groupName?: string | null;
  stadium?: string | null;
  kickoffAt: string;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  sourceUpdatedAt?: string | null;
  // SPEC_MISMATCH: never populated by current backend; treat as effectively null.
  aiSummary?: string | null;
};

// MatchEventDto — field names per contract (eventType, playerId, extraMinute).
export type MatchEvent = {
  id: string;
  minute: number | null;
  extraMinute: number | null;
  eventType: string; // free-form string, not an enum
  teamId: string | null;
  playerId: string | null;
  description: string | null;
};

// MatchDetailDto = MatchSummary & { events }. No keyPlayers / reports.
export type MatchDetail = MatchSummary & {
  events: MatchEvent[];
};

export type AiReport = {
  id: string;
  entityType: string;
  entityId?: string | null;
  reportType: string;
  provider: AiProvider;
  model?: string | null;
  language: string;
  title?: string | null;
  content?: string | null;
  structuredJson?: unknown;
  confidenceScore?: number | null;
  status: AiReportStatus;
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

export type NewsTag = { id: string; name: string; type: NewsTagType };

export type NewsSummary = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  titleEn: string;
  titleZh?: string | null;
  summaryEn?: string | null;
  summaryZh?: string | null;
  publishedAt?: string | null;
  category?: NewsCategory | null;
  tags?: NewsTag[];
  translationStatus?: TranslationStatus;
};

// NewsDetailDto = NewsSummary & { contentSnippet, translatedContentZh, language, fetchedAt }.
export type NewsDetail = NewsSummary & {
  contentSnippet: string | null;
  translatedContentZh: string | null;
  language: string | null;
  fetchedAt: string | null;
};

export type ChampionPredictionEntry = {
  id: string;
  team: TeamSummary;
  rank: number;
  championScore: number;
  ratingTier?: TeamRatingTier;
  probabilityText?: string | null;
  strengths: string[];
  risks: string[];
  aiComment?: string | null;
};

export type ChampionPredictionResponse = {
  runId: string;
  status: JobStatus;
  createdAt: string;
  completedAt?: string | null;
  entries: ChampionPredictionEntry[];
  finalReport?: AiReport | null;
  nvidiaReport?: AiReport | null;
  qwenReport?: AiReport | null;
};

export type ChatAnswer = {
  answer: string;
  provider: AiProvider;
  model?: string | null;
  sourceUpdatedAt?: string | null;
};

// ----- Composite responses -----

export type HomeHighlightsResponse = {
  featuredMatches: MatchSummary[];
  championSummary: ChampionPredictionEntry[];
  featuredTeams: TeamSummary[];
  featuredPlayers: PlayerSummary[];
  newsHighlights: NewsSummary[];
};

export type FavoritesResponse = {
  teams: TeamSummary[];
  players: PlayerSummary[];
};

// Favorite mutations always return { success: true } today; tolerate FavoritesResponse too.
export type FavoriteMutationResponse = FavoritesResponse | { success: true };

export type LoginResponse = {
  user: User;
  // Backend types this as a plain string; current values: /matches | /admin/accounts.
  redirectPath: string;
};

// ----- Request payloads (only contract-whitelisted fields) -----

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = { email: string; password: string };

export type UpdateMeRequest = {
  displayName?: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
};

export type AdminCreateUserRequest = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

// register-admin does NOT accept a role field (always creates ADMIN).
export type AdminRegisterAdminRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type AdminUpdateRoleRequest = { role: UserRole };

export type GeneralChatRequest = { question: string };
