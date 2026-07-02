import { describe, it, expect } from 'vitest';
import { ApiError } from '@/lib/api-client';
import {
  aiErrorMessage,
  isQuotaError,
  parseNewsAnalysis,
  parsePlayerStatusSummary,
  quotaDetails,
  quotaResetHint,
} from '@/lib/ai';

function quotaError(overrides?: Partial<{ used: number; limit: number; resetAt: string }>) {
  return new ApiError(429, 'AI_QUOTA_EXCEEDED', '今日一般問答額度已用完（20 次）。', {
    quotaKey: 'GENERAL_CHAT',
    limit: overrides?.limit ?? 20,
    used: overrides?.used ?? 20,
    resetAt: overrides?.resetAt ?? '2026-07-03T00:00:00.000Z',
  });
}

describe('quota helpers', () => {
  it('isQuotaError only matches 429 AI_QUOTA_EXCEEDED', () => {
    expect(isQuotaError(quotaError())).toBe(true);
    expect(isQuotaError(new ApiError(403, 'FORBIDDEN', 'x'))).toBe(false);
    expect(isQuotaError(new ApiError(429, 'OTHER', 'x'))).toBe(false);
    expect(isQuotaError(new Error('boom'))).toBe(false);
  });

  it('quotaDetails reads the structured block', () => {
    const d = quotaDetails(quotaError({ used: 20, limit: 20 }));
    expect(d).toEqual({
      quotaKey: 'GENERAL_CHAT',
      limit: 20,
      used: 20,
      resetAt: '2026-07-03T00:00:00.000Z',
    });
    expect(quotaDetails(new ApiError(403, 'FORBIDDEN', 'x'))).toBeNull();
  });

  it('quotaResetHint scales minutes → hours → days', () => {
    const inMinutes = new Date(Date.now() + 30 * 60_000).toISOString();
    expect(quotaResetHint(inMinutes)).toMatch(/分鐘後恢復/);
    const inHours = new Date(Date.now() + 5 * 3_600_000).toISOString();
    expect(quotaResetHint(inHours)).toBe('約 5 小時後恢復');
    const inDays = new Date(Date.now() + 3 * 24 * 3_600_000).toISOString();
    expect(quotaResetHint(inDays)).toBe('約 3 天後恢復');
    expect(quotaResetHint(new Date(Date.now() - 1000).toISOString())).toMatch(/已恢復/);
    expect(quotaResetHint(null)).toBe('');
  });

  it('aiErrorMessage keeps the quota message and maps other errors', () => {
    expect(aiErrorMessage(quotaError())).toContain('額度已用完');
    expect(aiErrorMessage(new ApiError(403, 'FORBIDDEN', 'x'))).toBe(
      '你的帳號目前無法使用此功能。',
    );
    expect(aiErrorMessage(new ApiError(0, 'NETWORK_ERROR', 'x'))).toBe('載入時發生錯誤，請稍後再試。');
    expect(aiErrorMessage('weird', '備援')).toBe('備援');
  });
});

describe('parseNewsAnalysis', () => {
  it('extracts summary, entities and normalizes direction', () => {
    const r = parseNewsAnalysis({
      impactSummaryZh: '（推論）影響中場輪換。',
      affectedTeams: [{ name: 'Brazil', impact: 'x', direction: 'NEGATIVE' }],
      affectedPlayers: [
        { name: 'Neymar', impact: 'y', direction: 'weird' },
        { impact: 'no name' },
      ],
      confidenceScore: 60,
      dataLimitations: ['來源單一'],
    });
    expect(r.impactSummaryZh).toBe('（推論）影響中場輪換。');
    expect(r.affectedTeams).toEqual([{ name: 'Brazil', impact: 'x', direction: 'NEGATIVE' }]);
    // Unknown direction string → UNKNOWN; entity without name dropped.
    expect(r.affectedPlayers).toEqual([{ name: 'Neymar', impact: 'y', direction: 'UNKNOWN' }]);
    expect(r.confidenceScore).toBe(60);
    expect(r.dataLimitations).toEqual(['來源單一']);
  });

  it('returns safe defaults for garbage', () => {
    const r = parseNewsAnalysis(null);
    expect(r.impactSummaryZh).toBeNull();
    expect(r.affectedTeams).toEqual([]);
    expect(r.affectedPlayers).toEqual([]);
    expect(r.confidenceScore).toBeNull();
  });
});

describe('parsePlayerStatusSummary', () => {
  it('extracts status fields', () => {
    const r = parsePlayerStatusSummary({
      statusSummaryZh: '（推論）狀態回穩。',
      injuryRiskLevel: 'LOW',
      formScore: 82,
      dataLimitations: ['樣本少'],
    });
    expect(r.statusSummaryZh).toBe('（推論）狀態回穩。');
    expect(r.injuryRiskLevel).toBe('LOW');
    expect(r.formScore).toBe(82);
    expect(r.dataLimitations).toEqual(['樣本少']);
  });

  it('defaults for garbage', () => {
    const r = parsePlayerStatusSummary('nope');
    expect(r.statusSummaryZh).toBeNull();
    expect(r.injuryRiskLevel).toBeNull();
    expect(r.formScore).toBeNull();
  });
});
