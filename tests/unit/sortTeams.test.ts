import { describe, it, expect } from 'vitest';
import { sortTeams } from '@/features/teams/use-teams';
import { teamFixtures } from '@/tests/mocks/fixtures';
import type { TeamSummary } from '@/types/api';

function team(id: string, isEliminated: boolean): TeamSummary {
  return { ...teamFixtures[0], id, isEliminated };
}

describe('sortTeams', () => {
  it('puts non-eliminated teams before eliminated ones', () => {
    const input = [
      team('out-1', true),
      team('in-1', false),
      team('out-2', true),
      team('in-2', false),
    ];

    const ordered = sortTeams(input).map((t) => t.id);

    expect(ordered).toEqual(['in-1', 'in-2', 'out-1', 'out-2']);
  });

  it('preserves the incoming order within each group (stable)', () => {
    const input = [
      team('in-a', false),
      team('in-b', false),
      team('out-a', true),
      team('out-b', true),
    ];

    const ordered = sortTeams(input).map((t) => t.id);

    expect(ordered).toEqual(['in-a', 'in-b', 'out-a', 'out-b']);
  });

  it('does not mutate the input array', () => {
    const input = [team('a', true), team('b', false)];
    const copy = [...input];
    sortTeams(input);
    expect(input).toEqual(copy);
  });
});
