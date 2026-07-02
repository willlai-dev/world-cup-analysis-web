// Helpers for AI payloads: defensively parse AiReport.structuredJson (typed as
// `unknown`) into view models, and derive the "示範/降級" mode label from provider.
import { ApiError } from '@/lib/api-client';
import { COPY } from '@/lib/constants';
import type {
  AiProvider,
  AiQuotaDetails,
  AiQuotaKey,
  AiReport,
  ImpactDirection,
  LikelyScoreline,
  MatchAnalysisKeyPlayer,
  MatchAnalysisStructured,
  NewsAnalysisStructured,
  NewsImpactEntity,
  PlayerRatingStructured,
  PlayerRatingTier,
  PlayerStatusSummaryStructured,
  RiskLevel,
} from '@/types/api';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function numOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function strOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function parsePlayerRating(json: unknown): PlayerRatingStructured {
  const r = asRecord(json);
  return {
    overallScore: numOrNull(r.overallScore),
    ratingTier: typeof r.ratingTier === 'string' ? (r.ratingTier as PlayerRatingTier) : null,
    attackScore: numOrNull(r.attackScore),
    creativityScore: numOrNull(r.creativityScore),
    techniqueScore: numOrNull(r.techniqueScore),
    defenseScore: numOrNull(r.defenseScore),
    physicalScore: numOrNull(r.physicalScore),
    formScore: numOrNull(r.formScore),
    strengths: strArray(r.strengths),
    weaknesses: strArray(r.weaknesses),
    roleSummary: strOrNull(r.roleSummary),
    injuryRiskLevel: typeof r.injuryRiskLevel === 'string' ? (r.injuryRiskLevel as RiskLevel) : null,
    dataLimitations: strArray(r.dataLimitations),
  };
}

export function parseMatchAnalysis(json: unknown): MatchAnalysisStructured {
  const r = asRecord(json);
  const keyPlayers = (Array.isArray(r.keyPlayers) ? r.keyPlayers : [])
    .map((x): MatchAnalysisKeyPlayer | null => {
      const rec = asRecord(x);
      const name = strOrNull(rec.name);
      return name ? { name, reason: strOrNull(rec.reason) } : null;
    })
    .filter((x): x is MatchAnalysisKeyPlayer => x !== null);
  return {
    title: strOrNull(r.title),
    summary: strOrNull(r.summary),
    keyPlayers,
  };
}

const IMPACT_DIRECTIONS = new Set<ImpactDirection>([
  'POSITIVE',
  'NEGATIVE',
  'NEUTRAL',
  'UNKNOWN',
]);

function asDirection(value: unknown): ImpactDirection {
  return typeof value === 'string' && IMPACT_DIRECTIONS.has(value as ImpactDirection)
    ? (value as ImpactDirection)
    : 'UNKNOWN';
}

function impactEntities(value: unknown): NewsImpactEntity[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x): NewsImpactEntity | null => {
      const rec = asRecord(x);
      const name = strOrNull(rec.name);
      return name
        ? { name, impact: strOrNull(rec.impact) ?? '', direction: asDirection(rec.direction) }
        : null;
    })
    .filter((x): x is NewsImpactEntity => x !== null);
}

// GET /news/:id/analysis → AiReportDto.structuredJson (NEWS_IMPACT_ANALYSIS, §4).
export function parseNewsAnalysis(json: unknown): NewsAnalysisStructured {
  const r = asRecord(json);
  return {
    impactSummaryZh: strOrNull(r.impactSummaryZh),
    affectedTeams: impactEntities(r.affectedTeams),
    affectedPlayers: impactEntities(r.affectedPlayers),
    confidenceScore: numOrNull(r.confidenceScore),
    dataLimitations: strArray(r.dataLimitations),
  };
}

// GET /players/:id/analysis when reportType === "PLAYER_STATUS_SUMMARY" (§5).
export function parsePlayerStatusSummary(json: unknown): PlayerStatusSummaryStructured {
  const r = asRecord(json);
  return {
    statusSummaryZh: strOrNull(r.statusSummaryZh),
    injuryRiskLevel:
      typeof r.injuryRiskLevel === 'string' ? (r.injuryRiskLevel as RiskLevel) : null,
    formScore: numOrNull(r.formScore),
    dataLimitations: strArray(r.dataLimitations),
  };
}

// "資料有限推估" — show a faint hint when the model flagged data limitations.
export function hasEstimate(dataLimitations?: string[] | null): boolean {
  return Array.isArray(dataLimitations) && dataLimitations.length > 0;
}

// Non-real AI mode label (§6). null = a genuine NVIDIA/QWEN output.
export function aiModeLabel(provider: AiProvider, model?: string | null): string | null {
  if (provider !== 'PROGRAM_RULE') return null;
  return model === 'mock' ? '示範資料' : '暫時無法使用';
}

// ----- AI quota (Phase 3 §1) -----

// True for HTTP 429 AI_QUOTA_EXCEEDED from any AI endpoint.
export function isQuotaError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 429 && error.code === 'AI_QUOTA_EXCEEDED';
}

// Reads the structured quota block off a 429 error's details. Never trust the
// hardcoded limits — always read limit/used/resetAt from here.
export function quotaDetails(error: unknown): AiQuotaDetails | null {
  if (!isQuotaError(error)) return null;
  const d = error.details;
  if (!d || typeof d !== 'object') return null;
  const rec = d as Record<string, unknown>;
  const quotaKey = rec.quotaKey;
  const limit = rec.limit;
  const used = rec.used;
  const resetAt = rec.resetAt;
  if (typeof quotaKey !== 'string' || typeof resetAt !== 'string') return null;
  return {
    quotaKey: quotaKey as AiQuotaKey,
    limit: typeof limit === 'number' ? limit : 0,
    used: typeof used === 'number' ? used : 0,
    resetAt,
  };
}

// "約 N 分鐘/小時/天後恢復" derived from resetAt. Empty when past/invalid.
export function quotaResetHint(resetAt?: string | null): string {
  if (!resetAt) return '';
  const reset = new Date(resetAt).getTime();
  if (Number.isNaN(reset)) return '';
  const diffMs = reset - Date.now();
  if (diffMs <= 0) return '額度應已恢復，請重新整理後再試。';
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `約 ${minutes} 分鐘後恢復`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `約 ${hours} 小時後恢復`;
  const days = Math.round(hours / 24);
  return `約 ${days} 天後恢復`;
}

// Single place every AI surface turns an error into user-facing copy. Quota 429
// keeps the backend's (already-Chinese) message; other cases fall back per code.
export function aiErrorMessage(error: unknown, fallback: string = COPY.genericError): string {
  if (isQuotaError(error)) {
    return error.message || '今日 AI 額度已用完，請稍後再試。';
  }
  if (error instanceof ApiError) {
    if (error.isForbidden) return COPY.forbidden;
    if (error.code === 'NETWORK_ERROR') return COPY.genericError;
    return error.message || fallback;
  }
  return fallback;
}

// Parse a JSON blob that some backends store inside AiReport.content. Returns null
// when the text isn't JSON so callers can show it as prose instead.
export function tryParseJson(text?: string | null): unknown {
  if (!text) return null;
  const t = text.trim();
  if (!(t.startsWith('{') || t.startsWith('['))) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

// content that is safe to show verbatim (real prose, not a serialized JSON blob).
export function plainProse(content?: string | null): string | null {
  if (!content) return null;
  const t = content.trim();
  if (!t) return null;
  if ((t.startsWith('{') || t.startsWith('[')) && tryParseJson(t) !== null) return null;
  return t;
}

// Best structured source for a report: explicit structuredJson, else JSON embedded
// in content. Used so users never see a raw JSON dump.
export function structuredSource(
  report?: { structuredJson?: unknown; content?: string | null } | null,
): unknown {
  if (!report) return null;
  if (report.structuredJson != null) return report.structuredJson;
  return tryParseJson(report.content);
}

// Most-likely scorelines, wherever the backend puts them: top-level on the
// prediction, or nested in its report.structuredJson (optionally under `prediction`).
export function parseScorelines(source: unknown): LikelyScoreline[] {
  const rec = asRecord(source);
  const raw = Array.isArray(rec.likelyScorelines)
    ? rec.likelyScorelines
    : Array.isArray(asRecord(rec.prediction).likelyScorelines)
      ? (asRecord(rec.prediction).likelyScorelines as unknown[])
      : [];
  return (raw as unknown[])
    .map((x): LikelyScoreline | null => {
      const r = asRecord(x);
      const score = strOrNull(r.score);
      const probability = numOrNull(r.probability);
      return score && probability != null ? { score, probability } : null;
    })
    .filter((x): x is LikelyScoreline => x !== null);
}

// Pull the best scorelines for a prediction (top-level first, then its report).
export function predictionScorelines(prediction: {
  likelyScorelines?: LikelyScoreline[];
  report?: AiReport | null;
}): LikelyScoreline[] {
  if (prediction.likelyScorelines && prediction.likelyScorelines.length > 0) {
    return prediction.likelyScorelines;
  }
  return parseScorelines(prediction.report?.structuredJson);
}
