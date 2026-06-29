import type { LocalRole, MatchStatus, PlayerPosition, TeamRatingTier } from '@/types/api';

export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:3000/api';

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3001';

// Session cookie name used only by the optional middleware/proxy presence check.
// NOTE: not yet confirmed with the backend — middleware/proxy stays disabled until it is.
export const SESSION_COOKIE_NAME = 'wc_session';

// Empty / error / state copy — sourced from 08_FRONTEND_PAGES_COMPONENTS_SPEC.md.
export const COPY = {
  empty: '目前沒有符合條件的資料。',
  aiPending: '此分析尚未生成，請稍後再查看。',
  aiFailed: '此分析目前產生失敗，請稍後再試。',
  forbidden: '你的帳號目前無法使用此功能。',
  insufficientData: '目前資料不足，無法產生可靠分析。',
  genericError: '載入時發生錯誤，請稍後再試。',
} as const;

export const CONTINENTS = [
  'AFC',
  'CAF',
  'CONCACAF',
  'CONMEBOL',
  'OFC',
  'UEFA',
] as const;

export const TEAM_RATING_TIERS: TeamRatingTier[] = ['S', 'A', 'B', 'C', 'UNKNOWN'];

export const MATCH_STATUSES: MatchStatus[] = [
  'SCHEDULED',
  'LIVE',
  'FINISHED',
  'POSTPONED',
  'CANCELLED',
];

export const PLAYER_POSITIONS: PlayerPosition[] = ['GK', 'DF', 'MF', 'FW', 'UNKNOWN'];

export const DEFAULT_PAGE_SIZE = 20;

// Routes a role is allowed to navigate to. Used by the authoritative layout guards.
export const ROLE_HOME: Record<LocalRole, string> = {
  GUEST: '/login',
  USER: '/matches',
  PREMIUM: '/matches',
  ADMIN: '/admin/accounts',
};
