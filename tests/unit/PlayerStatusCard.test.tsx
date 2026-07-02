import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStatusCard } from '@/components/ai/PlayerStatusCard';
import { playerStatusReportFixture } from '@/tests/mocks/fixtures';
import type { AiReport } from '@/types/api';

describe('PlayerStatusCard', () => {
  it('renders the status summary, injury light and inference note', () => {
    render(<PlayerStatusCard report={playerStatusReportFixture} />);

    const card = screen.getByTestId('player-status-card');
    expect(card).toHaveAttribute('data-state', 'done');
    expect(screen.getByText(/狀態回穩/)).toBeInTheDocument();
    expect(screen.getByText('AI 推論，僅供參考')).toBeInTheDocument();
    // Injury risk badge (LOW).
    expect(screen.getByTestId('injury-risk-badge')).toBeInTheDocument();
  });

  it('shows the failure copy for a FAILED report', () => {
    const failed: AiReport = { ...playerStatusReportFixture, status: 'FAILED' };
    render(<PlayerStatusCard report={failed} />);
    expect(screen.getByTestId('player-status-card')).toHaveAttribute('data-state', 'failed');
  });
});
