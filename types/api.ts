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
  // Phase 2: always present on TeamSummary (incl. nested PlayerSummary.team).
  // true = confirmed out of the tournament (knockout loss, or failed to
  // advance from the group stage once the round-of-32 bracket is set).
  isEliminated: boolean;
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

// Most-likely scorelines for an upcoming match (up to 3, probability-desc).
export type LikelyScoreline = { score: string; probability: number };

export type MatchPrediction = {
  matchId: string;
  homeWinProbability?: number | null;
  drawProbability?: number | null;
  awayWinProbability?: number | null;
  likelyScorelines?: LikelyScoreline[];
  keyFactors: string[];
  riskNotes: string[];
  report?: AiReport | null;
  sourceUpdatedAt?: string | null;
  // Program-rule calibrated probabilities (0-100, sum 100): temperature scaling
  // fitted on past real predictions + shrunk per-team bias tilt; null until
  // enough settled samples exist.
  calibrated?: {
    method: 'temperature+team-bias';
    homeWinProbability: number;
    drawProbability: number;
    awayWinProbability: number;
    // Fitted softmax temperature; > 1 = model has been overconfident.
    temperature: number;
    sampleSize: number;
    // Applied log-odds shift on each side's win probability; null when 0.
    homeBiasAdjustment?: number | null;
    awayBiasAdjustment?: number | null;
    // likelyScorelines re-scaled to agree with the calibrated 1X2 above.
    scorelines?: LikelyScoreline[] | null;
  } | null;
};

// ----- structuredJson shapes (AiReport.structuredJson is `unknown`; parse defensively) -----

// GET /players/:id/rating → AiReportDto.structuredJson (PLAYER_HEXAGON_ANALYSIS).
export type PlayerRatingStructured = {
  overallScore?: number | null;
  ratingTier?: PlayerRatingTier | null;
  attackScore?: number | null;
  creativityScore?: number | null;
  techniqueScore?: number | null;
  defenseScore?: number | null;
  physicalScore?: number | null;
  formScore?: number | null;
  strengths: string[];
  weaknesses: string[];
  roleSummary?: string | null;
  injuryRiskLevel?: RiskLevel | null;
  dataLimitations: string[];
};

// GET /matches/:id/analysis → AiReportDto.structuredJson (MATCH_ANALYSIS).
export type MatchAnalysisKeyPlayer = { name: string; reason?: string | null };
export type MatchAnalysisStructured = {
  title?: string | null;
  summary?: string | null;
  keyPlayers: MatchAnalysisKeyPlayer[];
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
  // Phase 2: AI summary/classification may still be pending, in which case
  // summaryZh / category / tags can be empty. Treat all of those as nullable.
  aiSummaryStatus?: AiReportStatus;
};

// NewsDetailDto = NewsSummary & { contentSnippet, contentEn, translatedContentZh, language, fetchedAt }.
export type NewsDetail = NewsSummary & {
  contentSnippet: string | null;
  /** Full plain-text original body when the source provides one (Guardian). */
  contentEn?: string | null;
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

// Phase 3 §2: model-divergence panel carried inline on the champion response.
// `computable=false` (always so in AI_MOCK_MODE) → hide the panel / show raw reports.
export type ChampionTeamDelta = {
  teamName: string;
  nvidiaRank?: number | null; // NVIDIA rank; null when not listed by that model
  qwenRank?: number | null; // Qwen rank
  rankDelta?: number | null; // |difference| when both models ranked the team
};

export type ChampionDivergence = {
  computable: boolean;
  summary: string; // ready-to-display Chinese comparison text
  teamDeltas: ChampionTeamDelta[];
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
  // Phase 3 §2 / §3 — both optional; older runs / mock mode leave them null.
  divergence?: ChampionDivergence | null;
  // reportType = "FINAL_REPORT_POLISH"; content is 繁中 markdown.
  polishedReport?: AiReport | null;
};

// ----- Phase 3 §4: News impact analysis (GET /news/:id/analysis) -----

export type ImpactDirection = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN';

export type NewsImpactEntity = {
  name: string;
  impact: string;
  direction: ImpactDirection;
};

// AiReport.structuredJson shape for the NEWS_IMPACT_ANALYSIS report.
export type NewsAnalysisStructured = {
  impactSummaryZh: string | null;
  affectedTeams: NewsImpactEntity[];
  affectedPlayers: NewsImpactEntity[];
  confidenceScore: number | null;
  dataLimitations: string[];
};

// ----- Phase 3 §5: Player status / injury summary (GET /players/:id/analysis) -----

// structuredJson shape for the PLAYER_STATUS_SUMMARY report (distinct from the
// PLAYER_HEXAGON_ANALYSIS the same endpoint may still return — branch on reportType).
export type PlayerStatusSummaryStructured = {
  statusSummaryZh: string | null;
  injuryRiskLevel: RiskLevel | null;
  formScore: number | null;
  dataLimitations: string[];
};

export type ChatAnswer = {
  answer: string;
  provider: AiProvider;
  model?: string | null;
  sourceUpdatedAt?: string | null;
};

// One prior message in a multi-turn general-chat thread. Old→new order, roles
// limited to user/assistant. The backend is stateless: the client owns the
// thread and replays recent turns as `history` on each request.
export type ChatRole = 'user' | 'assistant';
export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// ----- Phase 3 §1: AI quota (HTTP 429, error.code = "AI_QUOTA_EXCEEDED") -----

export type AiQuotaKey =
  | 'GENERAL_CHAT'
  | 'DEEP_CHAT'
  | 'NEWS_TRANSLATION'
  | 'CHAMPION_RECALCULATE';

// Lives in ApiError.details on a 429. Read limit/used/resetAt from here — never
// hardcode the numbers (backend env controls them and they may change).
export type AiQuotaDetails = {
  quotaKey: AiQuotaKey;
  limit: number;
  used: number;
  resetAt: string; // ISO — next reset time
};

// ----- Composite responses -----

export type HomeHighlightsResponse = {
  featuredMatches: MatchSummary[];
  championSummary: ChampionPredictionEntry[];
  featuredTeams: TeamSummary[];
  featuredPlayers: PlayerSummary[];
  newsHighlights: NewsSummary[];
};

// ----- Match Refresh (POST /matches/:id/refresh) -----

export type RefreshStatus = 'UPDATED' | 'SKIPPED_COOLDOWN' | 'SKIPPED_NO_SOURCE' | 'SOURCE_FAILED';

export type RefreshMeta = {
  status: RefreshStatus;
  lastRefreshedAt: string | null;
  nextRefreshAt: string;
  reason?: string;
};

export type FavoritesResponse = {
  teams: TeamSummary[];
  players: PlayerSummary[];
};

// ----- Phase 3 §6: Admin AI usage stats (GET /admin/ai-usage) -----

export type AiUsageStats = {
  from: string;
  to: string;
  totals: {
    calls: number;
    done: number;
    failed: number;
    inputTokens: number;
    outputTokens: number;
  };
  byTaskType: { taskType: string; calls: number }[];
  byProvider: { provider: string; calls: number }[]; // includes PROGRAM_RULE
  byStatus: { status: string; calls: number }[];
  byDay: { day: string; calls: number }[]; // day = 00:00 UTC
  topUsers: {
    userId: string;
    email: string | null;
    displayName: string | null;
    calls: number;
  }[];
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

// Deep-chat (per-entity) request body — only `question` is whitelisted (no history).
export type DeepChatRequest = { question: string };

// Admin AI-usage query params (all optional; defaults to the last 7 days).
export type AiUsageQuery = {
  from?: string; // ISO
  to?: string; // ISO
  taskType?: string;
};

// ----- Prediction insights (PREMIUM) — GET /insights/predictions -----

export type PredictionTendency = 'HOME' | 'DRAW' | 'AWAY';

// Hit-rate aggregate over a set of settled predictions. Rates are 0-1, null when total=0.
export type PredictionInsightsBucket = {
  total: number;
  tendencyHits: number;
  tendencyHitRate: number | null;
  exactScoreHits: number;
  exactScoreHitRate: number | null;
  top3ScoreHits: number;
  top3ScoreHitRate: number | null;
  // Mean multi-class Brier (0 best, 2 worst); null when no scored leans.
  avgBrier: number | null;
  // Program-blend (Poisson × AI) scoreline A/B — rows carrying program metrics
  // (rolling-parameter backtest). Rates over programTotal. Optional: absent on
  // older backends — render defensively.
  programTotal?: number;
  programExactScoreHits?: number;
  programExactScoreHitRate?: number | null;
  programTop3ScoreHits?: number;
  programTop3ScoreHitRate?: number | null;
};

// One settled prediction (prediction snapshot vs the final score).
export type PredictionOutcomeItem = {
  matchId: string;
  stage: MatchStage;
  kickoffAt: string;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  actualHomeScore: number;
  actualAwayScore: number;
  // true = prediction was backfilled after the match (knowledge-contamination risk).
  retro: boolean;
  predictedAt: string;
  homeWinLean: number | null;
  drawLean: number | null;
  awayWinLean: number | null;
  likelyScorelines: LikelyScoreline[];
  tendencyPredicted: PredictionTendency | null;
  tendencyActual: PredictionTendency;
  tendencyHit: boolean;
  exactScoreHit: boolean;
  top3ScoreHit: boolean;
  brierScore: number | null;
  // Program-blend scorelines settled alongside the AI list; null when the
  // snapshot's leans were unusable. Optional: absent on older backends.
  programScorelines?: LikelyScoreline[] | null;
  programExactScoreHit?: boolean | null;
  programTop3ScoreHit?: boolean | null;
};

// Per-team predicted-vs-actual bias (program rules; includes retro rows, counted).
export type PredictionTeamBias = {
  team: TeamSummary;
  total: number;
  retroCount: number;
  tendencyHits: number;
  tendencyHitRate: number | null;
  overPerformed: number;
  underPerformed: number;
};

export type PredictionInsights = {
  summary: {
    overall: PredictionInsightsBucket;
    // Predictions genuinely made before kickoff — the only honest accuracy signal.
    real: PredictionInsightsBucket;
    // Backfilled retro predictions — shown separately, never blended into `real`.
    retro: PredictionInsightsBucket;
  };
  byStage: ({ stage: MatchStage } & PredictionInsightsBucket)[];
  // Most-sampled teams first.
  byTeam: PredictionTeamBias[];
  // Current program-rule calibration (real samples only); null when nothing settled.
  calibration: {
    sampleSize: number;
    avgConfidence: number;
    tendencyHitRate: number;
    // Fitted softmax temperature; > 1 = model has been overconfident.
    temperature: number;
    applied: boolean;
    // In-sample backtest: mean multi-class Brier before/after temperature scaling.
    baselineBrier: number | null;
    calibratedBrier: number | null;
  } | null;
  // Newest kickoff first.
  items: PredictionOutcomeItem[];
};

// ----- Admin manual data pipeline (docs/ADMIN_MANUAL_JOBS_FRONTEND.md) -----

// The individual jobs a pipeline can run, in the order presets execute them.
export type JobType =
  | 'SYNC_TEAMS'
  | 'SYNC_PLAYERS'
  | 'SYNC_FIXTURES'
  | 'SYNC_RESULTS'
  | 'FETCH_NEWS'
  | 'GENERATE_NEWS_SUMMARY'
  | 'GENERATE_NEWS_IMPACT'
  | 'GENERATE_PLAYER_RATINGS'
  | 'GENERATE_TEAM_RATINGS'
  | 'GENERATE_PLAYER_STATUS'
  | 'GENERATE_MATCH_ANALYSIS'
  | 'GENERATE_RETRO_ANALYSIS'
  | 'GENERATE_CHAMPION_PREDICTIONS'
  | 'SCORE_PREDICTIONS';

// Preset combinations for POST /admin/jobs/run (default FULL). `jobs` overrides these.
// FULL/SYNC/GENERATE are whole-DB presets; TEAMS/PLAYERS/MATCHES/NEWS/CHAMPION are
// per-domain (sync + that domain's AI analysis) so a single area can be refreshed.
// RETRO backfills pre-match-perspective analyses for finished matches, then settles.
export type PipelinePreset =
  | 'FULL'
  | 'SYNC'
  | 'GENERATE'
  | 'TEAMS'
  | 'PLAYERS'
  | 'MATCHES'
  | 'NEWS'
  | 'CHAMPION'
  | 'RETRO';

// One execution record from GET /admin/jobs/runs (newest first). `metadata` shape
// varies by job (sync/fetch vs AI-generate vs skipped vs error) — parse defensively.
export type JobRun = {
  jobRunId: string;
  jobType: JobType;
  status: JobStatus;
  startedAt: string | null;
  completedAt: string | null; // null while still running
  metadata: unknown;
};

// POST /admin/jobs/run body — both optional. `jobs` (non-empty) takes precedence
// over `pipeline`. Empty body === { pipeline: 'FULL' }.
export type RunPipelineRequest = {
  pipeline?: PipelinePreset;
  jobs?: JobType[];
};

// 202 Accepted payload — `label` is manual-<preset> / manual-custom; `jobTypes`
// is the ordered list this run will execute (align progress polling against it).
export type RunPipelineResponse = {
  started: boolean;
  label: string;
  jobTypes: JobType[];
};

export type JobRunsQuery = {
  limit?: number; // 1–200, default 50
  jobType?: JobType;
};

// POST /admin/jobs/run-team/:teamId — re-analyze a single country/team (docs §2.1).
// Finer-grained than the TEAMS preset (which touches all teams).
export type RunTeamRequest = {
  // Backend default is true (sync the squad from football-data first). false =
  // recompute from existing data only — faster, no external call / rate limit.
  sync?: boolean;
};

// 202 payload for run-team: same idea as RunPipelineResponse plus the resolved
// team identity (so the UI can confirm which country it matched).
export type RunTeamResponse = {
  started: boolean;
  teamId: string;
  teamName: string;
  jobTypes: JobType[];
};

// GET /admin/jobs/teams — ADMIN-readable team list for the run-team picker.
// `/api/teams` is USER/PREMIUM-only (admins 403 there), so the picker sources
// its options from this admin-guarded lookup instead.
export type AdminTeamOption = {
  id: string;
  nameEn: string;
  nameZh: string | null;
  fifaCode: string | null;
};
