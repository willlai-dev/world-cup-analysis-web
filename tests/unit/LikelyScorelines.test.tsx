import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { LikelyScorelines } from '@/components/charts/LikelyScorelines';
import { renderWithProviders } from '@/tests/utils';

const rawItems = [
  { score: '2-1', probability: 18 },
  { score: '1-1', probability: 15 },
  { score: '2-0', probability: 12 },
];

describe('LikelyScorelines', () => {
  it('renders raw probabilities only when no calibrated items exist', () => {
    renderWithProviders(<LikelyScorelines items={rawItems} />);
    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.queryByText(/原 /)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI × Poisson/)).not.toBeInTheDocument();
  });

  it('shows calibrated probabilities as primary with the raw value as context', () => {
    renderWithProviders(
      <LikelyScorelines
        items={rawItems}
        calibratedItems={[
          { score: '2-1', probability: 14.5 },
          { score: '1-1', probability: 16.3 },
          { score: '2-0', probability: 11 },
        ]}
      />,
    );
    // Calibrated values drive the display (rounded)…
    expect(screen.getByText('15%')).toBeInTheDocument(); // 14.5 → 15
    expect(screen.getByText('16%')).toBeInTheDocument(); // 16.3 → 16
    // …with the raw AI claims shown as secondary context.
    expect(screen.getByText('原 18%')).toBeInTheDocument();
    expect(screen.getByText('原 15%')).toBeInTheDocument();
    expect(screen.getByText(/AI × Poisson/)).toBeInTheDocument();
    // Rows re-rank by the calibrated probability: 1-1 (16.3) is now first.
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('1 : 1');
    expect(rows[1]).toHaveTextContent('2 : 1');
  });

  it('renders program-blend scores the AI never listed, without a raw value', () => {
    renderWithProviders(
      <LikelyScorelines
        items={rawItems}
        calibratedItems={[
          { score: '1-0', probability: 17 }, // from the Poisson grid only
          { score: '2-1', probability: 15 },
          { score: '1-1', probability: 14 },
        ]}
      />,
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('1 : 0');
    expect(rows[0]).toHaveTextContent('17%');
    expect(rows[0]).not.toHaveTextContent('原');
    expect(rows[1]).toHaveTextContent('原 18%'); // 2-1 keeps its AI claim as context
    // 2-0 from the AI list is displaced entirely by the blend.
    expect(screen.queryByText('2 : 0')).not.toBeInTheDocument();
  });

  it('sorts before slicing so an unsorted or longer list still shows the true top-3', () => {
    const calibratedItems = [
      { score: '2-1', probability: 10 },
      { score: '0-0', probability: 9 },
      { score: '1-1', probability: 18 }, // true leader arrives last
      { score: '1-0', probability: 15 },
    ];
    renderWithProviders(
      <LikelyScorelines items={rawItems} calibratedItems={calibratedItems} />,
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('1 : 1');
    expect(rows[1]).toHaveTextContent('1 : 0');
    expect(rows[2]).toHaveTextContent('2 : 1');
    expect(screen.queryByText('0 : 0')).not.toBeInTheDocument();
    // The input array is not mutated by the sort.
    expect(calibratedItems[0].score).toBe('2-1');
  });
});
