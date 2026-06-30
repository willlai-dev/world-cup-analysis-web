import type {
  ChampionPredictionResponse,
  HomeHighlightsResponse,
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
