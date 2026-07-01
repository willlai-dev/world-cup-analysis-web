import { describe, it, expect } from 'vitest';
import {
  aiModeLabel,
  hasEstimate,
  parseMatchAnalysis,
  parsePlayerRating,
  parseScorelines,
  plainProse,
  predictionScorelines,
  structuredSource,
  tryParseJson,
} from '@/lib/ai';

describe('parsePlayerRating', () => {
  it('extracts structured fields', () => {
    const r = parsePlayerRating({
      overallScore: 92,
      ratingTier: 'S',
      strengths: ['快', '準', ''],
      weaknesses: ['防守弱'],
      roleSummary: '進攻核心',
      injuryRiskLevel: 'LOW',
      dataLimitations: ['樣本少'],
    });
    expect(r.overallScore).toBe(92);
    expect(r.ratingTier).toBe('S');
    expect(r.strengths).toEqual(['快', '準']); // blank strings dropped
    expect(r.roleSummary).toBe('進攻核心');
    expect(r.injuryRiskLevel).toBe('LOW');
    expect(r.dataLimitations).toEqual(['樣本少']);
  });

  it('returns safe defaults for garbage input', () => {
    const r = parsePlayerRating('not-an-object');
    expect(r.overallScore).toBeNull();
    expect(r.strengths).toEqual([]);
    expect(r.weaknesses).toEqual([]);
    expect(r.dataLimitations).toEqual([]);
    expect(r.roleSummary).toBeNull();
  });
});

describe('parseMatchAnalysis', () => {
  it('keeps only key players with a name', () => {
    const r = parseMatchAnalysis({
      title: '焦點戰',
      summary: '勢均力敵',
      keyPlayers: [{ name: 'Mbappe', reason: '速度' }, { reason: 'no name' }, 'junk'],
    });
    expect(r.title).toBe('焦點戰');
    expect(r.keyPlayers).toEqual([{ name: 'Mbappe', reason: '速度' }]);
  });

  it('defaults keyPlayers to []', () => {
    expect(parseMatchAnalysis(null).keyPlayers).toEqual([]);
  });
});

describe('hasEstimate', () => {
  it('is true only when dataLimitations are present', () => {
    expect(hasEstimate(['x'])).toBe(true);
    expect(hasEstimate([])).toBe(false);
    expect(hasEstimate(undefined)).toBe(false);
  });
});

describe('aiModeLabel', () => {
  it('labels mock vs degradation vs real', () => {
    expect(aiModeLabel('PROGRAM_RULE', 'mock')).toBe('示範資料');
    expect(aiModeLabel('PROGRAM_RULE', null)).toBe('暫時無法使用');
    expect(aiModeLabel('NVIDIA', 'nemotron')).toBeNull();
    expect(aiModeLabel('QWEN', 'qwen-plus')).toBeNull();
  });
});

describe('JSON-safe content helpers', () => {
  it('tryParseJson parses objects and ignores prose', () => {
    expect(tryParseJson('{"a":1}')).toEqual({ a: 1 });
    expect(tryParseJson('這是分析')).toBeNull();
    expect(tryParseJson('{bad json')).toBeNull();
  });

  it('plainProse hides JSON blobs but keeps real prose', () => {
    expect(plainProse('這是一段分析文字')).toBe('這是一段分析文字');
    expect(plainProse('{"summary":"x"}')).toBeNull();
    expect(plainProse('   ')).toBeNull();
  });

  it('structuredSource prefers structuredJson, then JSON in content', () => {
    expect(structuredSource({ structuredJson: { a: 1 }, content: 'x' })).toEqual({ a: 1 });
    expect(structuredSource({ structuredJson: null, content: '{"b":2}' })).toEqual({ b: 2 });
    expect(structuredSource({ structuredJson: null, content: 'prose' })).toBeNull();
  });
});

describe('scoreline parsing', () => {
  it('parses top-level and nested likelyScorelines', () => {
    expect(parseScorelines({ likelyScorelines: [{ score: '2-1', probability: 18 }] })).toEqual([
      { score: '2-1', probability: 18 },
    ]);
    expect(
      parseScorelines({ prediction: { likelyScorelines: [{ score: '1-1', probability: 15 }] } }),
    ).toEqual([{ score: '1-1', probability: 15 }]);
    expect(parseScorelines(null)).toEqual([]);
  });

  it('predictionScorelines falls back to report.structuredJson', () => {
    expect(predictionScorelines({ likelyScorelines: [{ score: '2-0', probability: 12 }] })).toHaveLength(1);
    const nested = {
      report: { structuredJson: { likelyScorelines: [{ score: '3-1', probability: 9 }] } },
    } as unknown as Parameters<typeof predictionScorelines>[0];
    expect(predictionScorelines(nested)).toEqual([{ score: '3-1', probability: 9 }]);
  });
});
