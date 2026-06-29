import type { PlayerPosition, TeamRatingTier } from '@/types/api';

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(date);
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

export function teamName(team: { nameZh?: string | null; nameEn: string }): string {
  return team.nameZh?.trim() || team.nameEn;
}

export function playerName(player: { nameZh?: string | null; nameEn: string }): string {
  return player.nameZh?.trim() || player.nameEn;
}
