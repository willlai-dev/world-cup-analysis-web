// Shared API types — mirrors worldcup_ai_frontend_agent_docs/03_FRONTEND_READONLY_API_CONTRACT.md.
// Do not diverge from the backend contract.

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

// ----- Auth / User -----

// Backend returns only authenticated roles. GUEST is a frontend-local value.
export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type LocalRole = 'GUEST' | UserRole;
export type UserStatus = 'ACTIVE' | 'DISABLED';

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  // Optional profile fields surfaced by /users/me.
  nickname?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string | null;
};

// ----- Domain entities -----

export type TeamRatingTier = 'S' | 'A' | 'B' | 'C' | 'UNKNOWN';

export type TeamSummary = {
  id: string;
  nameEn: string;
  nameZh?: string | null;
  fifaCode?: string | null;
  continent?: string | null;
  groupName?: string | null;
  coachName?: string | null;
  flagUrl?: string | null;
  ratingTier?: TeamRatingTier;
  championScore?: number | null;
  formScore?: number | null;
  attackScore?: number | null;
  midfieldScore?: number | null;
  defenseScore?: number | null;
  statusScore?: number | null;
};

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW' | 'UNKNOWN';
export type PlayerRatingTier = 'S' | 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C' | 'UNKNOWN';
export type PlayerRole = 'STARTER' | 'ROTATION' | 'SUBSTITUTE' | 'IMPACT_PLAYER' | 'UNKNOWN';
export type InjuryRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type PlayerSummary = {
  id: string;
  teamId: string;
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
  injuryRiskLevel?: InjuryRiskLevel;
};

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type MatchSummary = {
  id: string;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  stage: string;
  groupName?: string | null;
  stadium?: string | null;
  kickoffAt: string;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  sourceUpdatedAt?: string | null;
  aiSummary?: string | null;
};

export type MatchEvent = {
  id: string;
  minute?: number | null;
  type: string;
  teamId?: string | null;
  playerName?: string | null;
  description?: string | null;
};

export type MatchDetail = MatchSummary & {
  events?: MatchEvent[];
  keyPlayers?: PlayerSummary[];
  reports?: AiReport[];
};

export type AiProvider = 'NVIDIA' | 'QWEN' | 'PROGRAM_RULE';
export type AiReportStatus = 'PENDING' | 'DONE' | 'FAILED';

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

export type TeamDetail = TeamSummary & {
  analysis?: AiReport | null;
  recentMatches?: MatchSummary[];
  keyPlayers?: PlayerSummary[];
};

export type PlayerDetail = PlayerSummary & {
  relatedNews?: NewsSummary[];
  analysis?: AiReport | null;
};

export type NewsTag = { id: string; name: string; type: string };
export type TranslationStatus = 'NONE' | 'PENDING' | 'DONE' | 'FAILED';

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
  tags?: NewsTag[];
  translationStatus?: TranslationStatus;
};

export type NewsDetail = NewsSummary & {
  contentSnippet?: string | null;
  translatedContentZh?: string | null;
  relatedEntities?: { teams?: TeamSummary[]; players?: PlayerSummary[] };
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

export type ChampionRunStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export type ChampionPredictionResponse = {
  runId: string;
  status: ChampionRunStatus;
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

// Favorite mutations may return the full FavoritesResponse or a bare ok flag.
export type FavoriteMutationResponse = FavoritesResponse | { success: true };

export type LoginResponse = {
  user: User;
  redirectPath: '/matches' | '/admin/accounts';
};

// ----- Request payloads -----

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

export type AdminUpdateRoleRequest = { role: UserRole };

export type GeneralChatRequest = { question: string };
