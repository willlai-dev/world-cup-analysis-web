import type { BadgeTone } from '@/components/ui/Badge';
import type {
  LocalRole,
  MatchStage,
  MatchStatus,
  NewsCategory,
  NewsTagType,
  PlayerPosition,
  TeamRatingTier,
} from '@/types/api';

export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:3000/api';

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3001';

// Session cookie name (backend uses HttpOnly JWT cookie `access_token`). Only used by
// the optional middleware/proxy presence check, which stays disabled in Phase 1.
export const SESSION_COOKIE_NAME = 'access_token';

// Empty / error / state copy — sourced from 08_FRONTEND_PAGES_COMPONENTS_SPEC.md.
export const COPY = {
  empty: '目前沒有符合條件的資料。',
  aiPending: '此分析尚未生成，請稍後再查看。',
  aiFailed: '此分析目前產生失敗，請稍後再試。',
  forbidden: '你的帳號目前無法使用此功能。',
  insufficientData: '目前資料不足，無法產生可靠分析。',
  genericError: '載入時發生錯誤，請稍後再試。',
  chatPlaceholder: '輸入你的問題…',
  chatEmpty: '輸入問題，或點選下方範例開始與 AI 對話。',
  chatError: '回答產生失敗，請稍後再試。',
  translatePrompt: '使用 AI 將新聞翻譯為繁體中文。',
  translatePending: '翻譯產生中…',
  translateFailed: '翻譯產生失敗，請稍後再試。',
} as const;

// Floating-chat example prompts — from 05_FRONTEND_AI_UI_REQUIREMENTS.md §Floating Chat.
export const CHAT_EXAMPLES = [
  '目前有哪些未開始的重點賽事？',
  '法國有哪些高評級球員？',
  '目前冠軍預測前三名是誰？',
  '最近有哪些關於阿根廷的新聞？',
] as const;

// Max question length accepted by POST /ai/chat (backend 1..1000).
export const CHAT_QUESTION_MAX = 1000;

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

export const MATCH_STAGES: MatchStage[] = [
  'GROUP',
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
  'UNKNOWN',
];

export const NEWS_CATEGORIES: NewsCategory[] = [
  'MATCH',
  'PLAYER',
  'INJURY',
  'TRANSFER',
  'TEAM',
  'TACTIC',
  'CONTROVERSY',
  'TOURNAMENT',
  'OTHER',
];

export const PLAYER_POSITIONS: PlayerPosition[] = ['GK', 'DF', 'MF', 'FW', 'UNKNOWN'];

// News tag chip colour by tag type (§5).
export const NEWS_TAG_TONES: Record<NewsTagType, BadgeTone> = {
  TEAM: 'brand',
  PLAYER: 'success',
  MATCH: 'neutral',
  TOPIC: 'neutral',
  INJURY: 'danger',
  TACTIC: 'warning',
  CONTROVERSY: 'danger',
  TRANSFER: 'premium',
  OTHER: 'neutral',
};

// Elimination filter (teams/players). Empty value = no filter. Avoid wording the
// "false" side as "已晉級" — group-stage elimination isn't reflected yet, so it
// only means "尚未淘汰".
export const ELIMINATION_OPTIONS: { label: string; value: 'true' | 'false' }[] = [
  { label: '仍在賽', value: 'false' },
  { label: '已淘汰', value: 'true' },
];

export const DEFAULT_PAGE_SIZE = 20;

// Routes a role is allowed to navigate to. Used by the authoritative layout guards.
export const ROLE_HOME: Record<LocalRole, string> = {
  GUEST: '/login',
  USER: '/matches',
  PREMIUM: '/matches',
  ADMIN: '/admin/accounts',
};
