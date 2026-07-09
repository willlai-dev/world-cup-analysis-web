import type {
  AiReport,
  AiUsageStats,
  ChampionPredictionResponse,
  HomeHighlightsResponse,
  MatchPrediction,
  MatchSummary,
  MeDto,
  NewsSummary,
  PlayerSummary,
  TeamSummary,
  User,
} from '@/types/api';

export const teamFixtures: TeamSummary[] = [
  {
    id: 'team-fra',
    nameEn: 'France',
    nameZh: '法國',
    fifaCode: 'FRA',
    continent: 'UEFA',
    groupName: 'A',
    coachName: 'Didier Deschamps',
    ratingTier: 'S',
    championScore: 88,
    formScore: 82,
    attackScore: 90,
    midfieldScore: 85,
    defenseScore: 84,
    statusScore: 80,
    isEliminated: false,
  },
  {
    id: 'team-arg',
    nameEn: 'Argentina',
    nameZh: '阿根廷',
    fifaCode: 'ARG',
    continent: 'CONMEBOL',
    groupName: 'B',
    coachName: 'Lionel Scaloni',
    ratingTier: 'S',
    championScore: 86,
    formScore: 84,
    attackScore: 88,
    midfieldScore: 86,
    defenseScore: 80,
    statusScore: 83,
    isEliminated: false,
  },
];

export const playerFixtures: PlayerSummary[] = [
  {
    id: 'player-mbappe',
    teamId: 'team-fra',
    team: teamFixtures[0],
    nameEn: 'Kylian Mbappe',
    nameZh: '姆巴佩',
    position: 'FW',
    clubName: 'Real Madrid',
    shirtNumber: 10,
    ratingTier: 'S',
    overallScore: 92,
    attackScore: 95,
    creativityScore: 88,
    techniqueScore: 90,
    defenseScore: 40,
    physicalScore: 88,
    formScore: 90,
    role: 'STARTER',
    injuryRiskLevel: 'LOW',
  },
  {
    id: 'player-messi',
    teamId: 'team-arg',
    team: teamFixtures[1],
    nameEn: 'Lionel Messi',
    nameZh: '梅西',
    position: 'FW',
    clubName: 'Inter Miami',
    shirtNumber: 10,
    ratingTier: 'S',
    overallScore: 91,
    attackScore: 90,
    creativityScore: 96,
    techniqueScore: 95,
    defenseScore: 35,
    physicalScore: 72,
    formScore: 85,
    role: 'STARTER',
    injuryRiskLevel: 'MEDIUM',
  },
];

export const matchFixtures: MatchSummary[] = [
  {
    id: 'match-1',
    homeTeam: teamFixtures[0],
    awayTeam: teamFixtures[1],
    stage: 'GROUP',
    groupName: 'A',
    stadium: 'Lusail Stadium',
    kickoffAt: '2026-06-15T18:00:00.000Z',
    status: 'SCHEDULED',
    aiSummary: '兩支頂級球隊的對決，攻防俱佳。',
  },
  {
    id: 'match-2',
    homeTeam: teamFixtures[1],
    awayTeam: teamFixtures[0],
    stage: 'GROUP',
    groupName: 'A',
    kickoffAt: '2026-06-10T15:00:00.000Z',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 1,
    aiSummary: '阿根廷在下半場逆轉取勝。',
  },
];

export const newsFixtures: NewsSummary[] = [
  {
    id: 'news-1',
    sourceName: 'The Guardian',
    sourceUrl: 'https://example.com/news-1',
    titleEn: 'France name strong squad for the tournament',
    titleZh: '法國公布強力參賽名單',
    summaryEn: 'France announced a strong squad.',
    summaryZh: '法國公布了一份實力堅強的名單。',
    publishedAt: '2026-06-01T09:00:00.000Z',
    category: 'TEAM',
    tags: [{ id: 'tag-1', name: 'France', type: 'TEAM' }],
    translationStatus: 'NONE',
  },
];

export const championFixture: ChampionPredictionResponse = {
  runId: 'run-1',
  status: 'DONE',
  createdAt: '2026-06-01T00:00:00.000Z',
  completedAt: '2026-06-01T00:05:00.000Z',
  entries: [
    {
      id: 'entry-1',
      team: teamFixtures[0],
      rank: 1,
      championScore: 88,
      ratingTier: 'S',
      probabilityText: '具備最高奪冠傾向。',
      strengths: ['攻擊火力強', '陣容深度足'],
      risks: ['防線老化'],
      aiComment: '本屆最被看好的奪冠熱門之一。',
    },
    {
      id: 'entry-2',
      team: teamFixtures[1],
      rank: 2,
      championScore: 86,
      ratingTier: 'S',
      probabilityText: '奪冠傾向次高。',
      strengths: ['中場控制力'],
      risks: ['體能負荷'],
      aiComment: '經驗豐富，具備奪冠實力。',
    },
  ],
  finalReport: null,
  nvidiaReport: null,
  qwenReport: null,
};

export const homeHighlightsFixture: HomeHighlightsResponse = {
  featuredMatches: matchFixtures,
  championSummary: championFixture.entries,
  featuredTeams: teamFixtures,
  featuredPlayers: playerFixtures,
  newsHighlights: newsFixtures,
};

export const userFixtures: Record<'user' | 'premium' | 'admin', User> = {
  user: {
    id: 'u-user',
    email: 'user@example.com',
    displayName: 'Normal User',
    role: 'USER',
    status: 'ACTIVE',
  },
  premium: {
    id: 'u-premium',
    email: 'premium@example.com',
    displayName: 'Premium User',
    role: 'PREMIUM',
    status: 'ACTIVE',
  },
  admin: {
    id: 'u-admin',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
};

export const adminUserList: User[] = [
  userFixtures.user,
  userFixtures.premium,
  userFixtures.admin,
];

export const meFixture: MeDto = {
  ...userFixtures.user,
  profile: { nickname: '小明', avatarUrl: null, bio: '世足愛好者' },
};

// AiReport for GET /players/:id/rating with structuredJson (PLAYER_HEXAGON_ANALYSIS).
export const playerRatingReportFixture: AiReport = {
  id: 'rating-1',
  entityType: 'PLAYER',
  entityId: 'player-mbappe',
  reportType: 'PLAYER_HEXAGON_ANALYSIS',
  provider: 'NVIDIA',
  model: 'nemotron-super',
  language: 'zh-Hant',
  title: 'AI 球員評級',
  content: '整體評價極高的前鋒。',
  structuredJson: {
    overallScore: 92,
    ratingTier: 'S',
    strengths: ['速度爆發力強', '射門把握度高'],
    weaknesses: ['防守參與度低'],
    roleSummary: '進攻核心，主要負責衝擊防線與終結機會。',
    injuryRiskLevel: 'LOW',
    dataLimitations: ['近期出賽樣本有限'],
  },
  confidenceScore: 0.86,
  status: 'DONE',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

// AiReport for GET /news/:id/analysis (Phase 3 §4, NEWS_IMPACT_ANALYSIS).
export const newsAnalysisReportFixture: AiReport = {
  id: 'news-analysis-1',
  entityType: 'NEWS',
  entityId: 'news-1',
  reportType: 'NEWS_IMPACT_ANALYSIS',
  provider: 'NVIDIA',
  model: 'nemotron-super',
  language: 'zh-Hant',
  title: null,
  content: null,
  structuredJson: {
    impactSummaryZh: '（推論）此傷病消息可能影響法國中場輪換。',
    affectedTeams: [{ name: 'France', impact: '（推論）中場調度受限。', direction: 'NEGATIVE' }],
    affectedPlayers: [{ name: 'Mbappe', impact: '（推論）需承擔更多進攻。', direction: 'UNKNOWN' }],
    confidenceScore: 60,
    dataLimitations: ['消息來源單一'],
  },
  confidenceScore: 60,
  status: 'DONE',
  createdAt: '2026-06-02T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
};

// AiReport for GET /players/:id/analysis when it returns PLAYER_STATUS_SUMMARY (§5).
export const playerStatusReportFixture: AiReport = {
  id: 'player-status-1',
  entityType: 'PLAYER',
  entityId: 'player-mbappe',
  reportType: 'PLAYER_STATUS_SUMMARY',
  provider: 'NVIDIA',
  model: 'nemotron-super',
  language: 'zh-Hant',
  title: null,
  content: null,
  structuredJson: {
    statusSummaryZh: '（推論）近兩場狀態回穩，無明顯傷病疑慮。',
    injuryRiskLevel: 'LOW',
    formScore: 82,
    dataLimitations: ['近期出賽樣本有限'],
  },
  confidenceScore: 0.7,
  status: 'DONE',
  createdAt: '2026-06-02T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
};

// ChampionPredictionResponse with Phase 3 §2/§3 fields populated (real mode).
export const championWithDivergenceFixture: ChampionPredictionResponse = {
  ...championFixture,
  divergence: {
    computable: true,
    summary: '冠軍首選分歧：NVIDIA 看好 France，Qwen 看好 Argentina；名次差最大：Argentina。',
    teamDeltas: [
      { teamName: 'France', nvidiaRank: 1, qwenRank: 2, rankDelta: 1 },
      { teamName: 'Argentina', nvidiaRank: 4, qwenRank: 1, rankDelta: 3 },
      { teamName: 'Spain', nvidiaRank: 3, qwenRank: null, rankDelta: null },
    ],
  },
  polishedReport: {
    id: 'polish-1',
    entityType: 'CHAMPION_PREDICTION',
    entityId: 'run-1',
    reportType: 'FINAL_REPORT_POLISH',
    provider: 'QWEN',
    model: 'qwen-plus',
    language: 'zh-Hant',
    title: '冠軍預測彙整報告',
    content: '## 冠軍預測\n\n**France** 具備最高奪冠傾向。\n\n- 攻擊火力強\n- 陣容深度足',
    structuredJson: null,
    confidenceScore: 0.8,
    status: 'DONE',
    createdAt: '2026-06-01T00:05:00.000Z',
    updatedAt: '2026-06-01T00:05:00.000Z',
  },
};

// AiUsageStats for GET /admin/ai-usage (Phase 3 §6).
export const aiUsageFixture: AiUsageStats = {
  from: '2026-06-25T00:00:00.000Z',
  to: '2026-07-02T00:00:00.000Z',
  totals: { calls: 120, done: 110, failed: 10, inputTokens: 45000, outputTokens: 32000 },
  byTaskType: [
    { taskType: 'GENERAL_CHAT', calls: 60 },
    { taskType: 'DEEP_CHAT', calls: 30 },
    { taskType: 'NEWS_TRANSLATION', calls: 20 },
    { taskType: 'CHAMPION_RECALCULATE', calls: 10 },
  ],
  byProvider: [
    { provider: 'NVIDIA', calls: 70 },
    { provider: 'QWEN', calls: 40 },
    { provider: 'PROGRAM_RULE', calls: 10 },
  ],
  byStatus: [
    { status: 'DONE', calls: 110 },
    { status: 'FAILED', calls: 10 },
  ],
  byDay: [
    { day: '2026-06-30T00:00:00.000Z', calls: 40 },
    { day: '2026-07-01T00:00:00.000Z', calls: 50 },
    { day: '2026-07-02T00:00:00.000Z', calls: 30 },
  ],
  topUsers: [
    { userId: 'u-premium', email: 'premium@example.com', displayName: 'Premium User', calls: 55 },
    { userId: 'u-user', email: 'user@example.com', displayName: 'Normal User', calls: 35 },
  ],
};

// MatchPrediction with likelyScorelines for GET /matches/:id/prediction.
export const matchPredictionFixture: MatchPrediction = {
  matchId: 'match-1',
  homeWinProbability: 46,
  drawProbability: 27,
  awayWinProbability: 27,
  likelyScorelines: [
    { score: '2-1', probability: 18 },
    { score: '1-1', probability: 15 },
    { score: '2-0', probability: 12 },
  ],
  keyFactors: ['主隊近期狀態佳'],
  riskNotes: ['關鍵中場可能缺陣'],
  report: null,
  sourceUpdatedAt: '2026-07-01T00:00:00.000Z',
  calibrated: {
    method: 'temperature+team-bias',
    homeWinProbability: 42.1,
    drawProbability: 29.4,
    awayWinProbability: 28.5,
    temperature: 1.24,
    sampleSize: 18,
    homeBiasAdjustment: 0.12,
    awayBiasAdjustment: null,
    // Program blend (AI × Poisson): may contain scores the AI never listed.
    scorelines: [
      { score: '2-1', probability: 16.5 },
      { score: '1-1', probability: 16.3 },
      { score: '1-0', probability: 12.1 },
    ],
  },
};
