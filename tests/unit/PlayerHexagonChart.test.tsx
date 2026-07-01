import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerHexagonChart, type HexAxis } from '@/components/charts/PlayerHexagonChart';

const axes: HexAxis[] = [
  { label: '進攻', value: 95 },
  { label: '創造', value: 88 },
  { label: '技術', value: 90 },
  { label: '防守', value: 40 },
  { label: '身體', value: 88 },
  { label: '狀態', value: null },
];

describe('PlayerHexagonChart', () => {
  it('renders an SVG with all six axis labels', () => {
    render(<PlayerHexagonChart axes={axes} />);
    expect(screen.getByTestId('player-hexagon')).toBeInTheDocument();
    for (const axis of axes) {
      expect(screen.getByText(axis.label)).toBeInTheDocument();
    }
  });

  it('renders a dash for a missing value', () => {
    render(<PlayerHexagonChart axes={axes} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
