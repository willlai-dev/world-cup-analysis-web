import { describe, it, expect } from 'vitest';
import { sortMatches } from '@/features/matches/use-matches';
import { teamFixtures } from '@/tests/mocks/fixtures';
import type { MatchStage, MatchStatus, MatchSummary } from '@/types/api';

function match(
  id: string,
  status: MatchStatus,
  kickoffAt: string,
  stage: MatchStage = 'GROUP',
): MatchSummary {
  return {
    id,
    homeTeam: teamFixtures[0],
    awayTeam: teamFixtures[1],
    stage,
    groupName: 'A',
    kickoffAt,
    status,
  };
}

describe('sortMatches', () => {
  it('orders live first, then scheduled, then finished with finished group stage last', () => {
    const input = [
      match('finished-group', 'FINISHED', '2026-06-10T15:00:00.000Z', 'GROUP'),
      match('scheduled', 'SCHEDULED', '2026-06-20T18:00:00.000Z'),
      match('finished-knockout', 'FINISHED', '2026-07-01T18:00:00.000Z', 'ROUND_OF_16'),
      match('live', 'LIVE', '2026-06-18T18:00:00.000Z'),
    ];

    const ordered = sortMatches(input).map((m) => m.id);

    expect(ordered).toEqual(['live', 'scheduled', 'finished-knockout', 'finished-group']);
  });

  it('sorts upcoming matches by soonest kickoff and finished by most recent', () => {
    const input = [
      match('scheduled-late', 'SCHEDULED', '2026-06-25T18:00:00.000Z'),
      match('scheduled-soon', 'SCHEDULED', '2026-06-20T18:00:00.000Z'),
      match('finished-old', 'FINISHED', '2026-06-10T18:00:00.000Z', 'ROUND_OF_16'),
      match('finished-recent', 'FINISHED', '2026-06-15T18:00:00.000Z', 'ROUND_OF_16'),
    ];

    const ordered = sortMatches(input).map((m) => m.id);

    expect(ordered).toEqual([
      'scheduled-soon',
      'scheduled-late',
      'finished-recent',
      'finished-old',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [
      match('a', 'FINISHED', '2026-06-10T15:00:00.000Z'),
      match('b', 'LIVE', '2026-06-18T18:00:00.000Z'),
    ];
    const copy = [...input];
    sortMatches(input);
    expect(input).toEqual(copy);
  });
});
