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
    expect(screen.queryByText(/已依校正後勝負機率調整/)).not.toBeInTheDocument();
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
    expect(screen.getByText(/已依校正後勝負機率調整/)).toBeInTheDocument();
    // Rows re-rank by the calibrated probability: 1-1 (16.3) is now first.
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('1 : 1');
    expect(rows[1]).toHaveTextContent('2 : 1');
  });
});
