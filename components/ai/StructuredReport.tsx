import { AiEstimateHint } from '@/components/ai/AiEstimateHint';
import { COPY } from '@/lib/constants';

// Human-readable renderer for an AI report object (structuredJson, or JSON that the
// backend stored inside `content`). The whole point is that users never see a raw
// JSON dump: we surface known prose/list fields and quietly ignore the rest.

const STRING_LABELS: Record<string, string> = {
  summary: '摘要',
  analysis: '分析',
  overview: '概述',
  roleSummary: '角色定位',
  conclusion: '結論',
  tacticalNotes: '戰術重點',
  comment: '評語',
  aiComment: '評語',
  probabilityText: '奪冠傾向',
};

const LIST_LABELS: Record<string, string> = {
  strengths: '優勢',
  weaknesses: '弱點',
  keyFactors: '關鍵因素',
  riskNotes: '風險',
  risks: '風險',
  recommendations: '建議',
  keyPoints: '重點',
};

// Numeric scores / metadata we deliberately don't dump as text.
const SKIP = new Set([
  'id', 'entityId', 'entityType', 'reportType', 'provider', 'model', 'language',
  'status', 'createdAt', 'updatedAt', 'confidenceScore', 'errorMessage',
  'ratingTier', 'overallScore', 'attackScore', 'creativityScore', 'techniqueScore',
  'defenseScore', 'physicalScore', 'formScore', 'injuryRiskLevel', 'matchId',
  'homeWinProbability', 'drawProbability', 'awayWinProbability', 'likelyScorelines',
  'title', 'dataLimitations', 'keyPlayers',
]);

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

type KeyPlayer = { name: string; reason?: string | null };
function keyPlayers(v: unknown): KeyPlayer[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x): KeyPlayer | null => {
      if (!x || typeof x !== 'object') return null;
      const rec = x as Record<string, unknown>;
      return typeof rec.name === 'string' && rec.name.trim()
        ? { name: rec.name, reason: typeof rec.reason === 'string' ? rec.reason : null }
        : null;
    })
    .filter((x): x is KeyPlayer => x !== null);
}

export function StructuredReport({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return <p className="text-sm text-amber-700">{COPY.insufficientData}</p>;
  }
  const rec = data as Record<string, unknown>;

  const paragraphs: { label: string | null; text: string }[] = [];
  const lists: { label: string; items: string[] }[] = [];

  // Known prose fields first (labeled).
  for (const [key, label] of Object.entries(STRING_LABELS)) {
    const v = rec[key];
    if (typeof v === 'string' && v.trim()) paragraphs.push({ label, text: v.trim() });
  }
  // Capture any other prose-length string field we didn't recognize (unlabeled),
  // so real analysis text is never lost — but skip scores/ids/short codes.
  for (const [key, v] of Object.entries(rec)) {
    if (SKIP.has(key) || key in STRING_LABELS || key in LIST_LABELS) continue;
    if (typeof v === 'string' && v.trim().length >= 12) paragraphs.push({ label: null, text: v.trim() });
  }
  // Known list fields.
  for (const [key, label] of Object.entries(LIST_LABELS)) {
    const v = rec[key];
    if (isStringArray(v) && v.length > 0) lists.push({ label, items: v });
  }

  const players = keyPlayers(rec.keyPlayers);
  const limitations = isStringArray(rec.dataLimitations) ? rec.dataLimitations : [];
  const hasContent = paragraphs.length > 0 || lists.length > 0 || players.length > 0;

  if (!hasContent) {
    return <p className="text-sm text-amber-700">{COPY.insufficientData}</p>;
  }

  return (
    <div className="flex flex-col gap-4" data-testid="structured-report">
      {typeof rec.title === 'string' && rec.title.trim() && (
        <h4 className="text-sm font-semibold text-slate-900">{rec.title.trim()}</h4>
      )}

      {paragraphs.map((p, i) => (
        <div key={i}>
          {p.label && <p className="mb-0.5 text-xs font-semibold text-slate-500">{p.label}</p>}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{p.text}</p>
        </div>
      ))}

      {players.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-slate-500">關鍵球員</p>
          <ul className="flex flex-col gap-1 text-sm text-slate-700">
            {players.map((kp) => (
              <li key={kp.name}>
                <span className="font-medium">{kp.name}</span>
                {kp.reason ? <span className="text-slate-600">：{kp.reason}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lists.map((l) => (
        <div key={l.label}>
          <p className="mb-1 text-xs font-semibold text-slate-500">{l.label}</p>
          <ul className="list-inside list-disc text-sm text-slate-600">
            {l.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <AiEstimateHint dataLimitations={limitations} />
    </div>
  );
}
