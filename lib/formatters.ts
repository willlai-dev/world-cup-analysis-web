import type {
  JobStatus,
  MatchStage,
  MatchStatus,
  NewsCategory,
  PlayerPosition,
  PlayerRatingTier,
  RiskLevel,
  TeamRatingTier,
} from '@/types/api';

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei',
  }).format(date);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeZone: 'Asia/Taipei' }).format(
    date,
  );
}

export function formatScore(home?: number | null, away?: number | null): string {
  if (home == null || away == null) return 'vs';
  return `${home} - ${away}`;
}

export function formatPercent(value?: number | null): string {
  if (value == null) return '—';
  // Accept either 0-1 fractions or 0-100 values.
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: '門將',
  DF: '後衛',
  MF: '中場',
  FW: '前鋒',
  UNKNOWN: '未知',
};

export function positionLabel(position: PlayerPosition): string {
  return POSITION_LABELS[position] ?? position;
}

const TEAM_TIER_LABELS: Record<TeamRatingTier, string> = {
  S: 'S 級',
  A: 'A 級',
  B: 'B 級',
  C: 'C 級',
  UNKNOWN: '未評級',
};

export function teamTierLabel(tier?: TeamRatingTier | null): string {
  if (!tier) return '未評級';
  return TEAM_TIER_LABELS[tier] ?? tier;
}

// Player rating tier as a short badge label: S / A+ / A / B+ / B / C / 未評級.
export function playerTierLabel(tier?: PlayerRatingTier | null): string {
  if (!tier || tier === 'UNKNOWN') return '未評級';
  return tier.replace('_PLUS', '+');
}

const MATCH_STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: '小組賽',
  ROUND_OF_32: '32 強',
  ROUND_OF_16: '16 強',
  QUARTER_FINAL: '八強',
  SEMI_FINAL: '四強',
  THIRD_PLACE: '季軍戰',
  FINAL: '決賽',
  UNKNOWN: '未定',
};

export function stageLabel(stage?: MatchStage | null): string {
  if (!stage) return '未定';
  return MATCH_STAGE_LABELS[stage] ?? stage;
}

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: '未開始',
  LIVE: '進行中',
  FINISHED: '已結束',
  POSTPONED: '延期',
  CANCELLED: '取消',
};

export function matchStatusLabel(status: MatchStatus): string {
  return MATCH_STATUS_LABELS[status] ?? status;
}

// Match event types are free-form strings from the data provider (not an enum);
// translate the common ones and fall back to the raw value.
const MATCH_EVENT_LABELS: Record<string, string> = {
  GOAL: '進球',
  OWN_GOAL: '烏龍球',
  PENALTY: '十二碼進球',
  PENALTY_GOAL: '十二碼進球',
  PENALTY_MISSED: '十二碼未進',
  MISSED_PENALTY: '十二碼未進',
  YELLOW_CARD: '黃牌',
  RED_CARD: '紅牌',
  SECOND_YELLOW: '兩黃一紅',
  YELLOW_RED_CARD: '兩黃一紅',
  SUBSTITUTION: '換人',
  VAR: 'VAR 判定',
  INJURY: '受傷',
};

export function matchEventLabel(eventType: string): string {
  const key = eventType.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return MATCH_EVENT_LABELS[key] ?? eventType;
}

// User-facing job status (champion prediction runs). The admin console keeps its
// own wording/tones in admin/jobs.
const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: '等待中',
  RUNNING: '運算中',
  DONE: '已完成',
  FAILED: '失敗',
};

export function jobStatusLabel(status: JobStatus): string {
  return JOB_STATUS_LABELS[status] ?? status;
}

const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  MATCH: '賽事',
  PLAYER: '球員',
  INJURY: '傷病',
  TRANSFER: '轉會',
  TEAM: '球隊',
  TACTIC: '戰術',
  CONTROVERSY: '爭議',
  TOURNAMENT: '賽會',
  OTHER: '其他',
};

export function newsCategoryLabel(category?: NewsCategory | null): string {
  if (!category) return '—';
  return NEWS_CATEGORY_LABELS[category] ?? category;
}

export function teamName(team: { nameZh?: string | null; nameEn: string }): string {
  return team.nameZh?.trim() || team.nameEn;
}

// "已淘汰" covers both knockout losses and group-stage exits (backend derives
// the full set from the match table). "仍在賽" = still alive in the tournament.
export function eliminationLabel(isEliminated?: boolean): string {
  return isEliminated ? '已淘汰' : '仍在賽';
}

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  UNKNOWN: '未知',
};

export function riskLabel(level?: RiskLevel | null): string {
  if (!level) return '未知';
  return RISK_LABELS[level] ?? level;
}

export function playerName(player: { nameZh?: string | null; nameEn: string }): string {
  return player.nameZh?.trim() || player.nameEn;
}
