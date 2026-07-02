import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ChampionDivergencePanel } from '@/components/ai/ChampionDivergencePanel';
import { championWithDivergenceFixture } from '@/tests/mocks/fixtures';

describe('ChampionDivergencePanel', () => {
  it('shows the summary and a row per team, sorted by rank gap', () => {
    const divergence = championWithDivergenceFixture.divergence!;
    render(<ChampionDivergencePanel divergence={divergence} />);

    expect(screen.getByTestId('champion-divergence')).toBeInTheDocument();
    expect(screen.getByText(/冠軍首選分歧/)).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    // header + 3 team rows
    expect(rows).toHaveLength(4);
    // Largest rankDelta (Argentina, 3) is sorted first among the body rows.
    expect(within(rows[1]).getByText('Argentina')).toBeInTheDocument();
  });

  it('marks single-model teams instead of a delta badge', () => {
    const divergence = championWithDivergenceFixture.divergence!;
    render(<ChampionDivergencePanel divergence={divergence} />);
    // Spain is only ranked by one model → "單邊".
    expect(screen.getByText('單邊')).toBeInTheDocument();
  });
});
