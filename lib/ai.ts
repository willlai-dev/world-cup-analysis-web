// Helpers for AI payloads: defensively parse AiReport.structuredJson (typed as
// `unknown`) into view models, and derive the "示範/降級" mode label from provider.
import type {
  AiProvider,
  AiReport,
  LikelyScoreline,
  MatchAnalysisKeyPlayer,
  MatchAnalysisStructured,
  PlayerRatingStructured,
  PlayerRatingTier,
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

// "資料有限推估" — show a faint hint when the model flagged data limitations.
export function hasEstimate(dataLimitations?: string[] | null): boolean {
  return Array.isArray(dataLimitations) && dataLimitations.length > 0;
}

// Non-real AI mode label (§6). null = a genuine NVIDIA/QWEN output.
export function aiModeLabel(provider: AiProvider, model?: string | null): string | null {
  if (provider !== 'PROGRAM_RULE') return null;
  return model === 'mock' ? '示範資料' : '暫時無法使用';
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
