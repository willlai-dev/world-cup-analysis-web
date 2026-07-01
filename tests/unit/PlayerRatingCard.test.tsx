import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerRatingCard } from '@/components/ai/PlayerRatingCard';
import { playerRatingReportFixture } from '@/tests/mocks/fixtures';
import type { AiReport } from '@/types/api';

describe('PlayerRatingCard', () => {
  it('renders structured strengths/weaknesses/roleSummary + estimate hint', () => {
    render(<PlayerRatingCard report={playerRatingReportFixture} />);
    expect(screen.getByTestId('player-rating-card')).toHaveAttribute('data-state', 'done');
    expect(screen.getByText('速度爆發力強')).toBeInTheDocument();
    expect(screen.getByText('防守參與度低')).toBeInTheDocument();
    expect(screen.getByText(/進攻核心/)).toBeInTheDocument();
    // dataLimitations → AI 推估 hint
    expect(screen.getByTestId('ai-estimate-hint')).toBeInTheDocument();
  });

  it('falls back to plain content when structuredJson is absent', () => {
    const report: AiReport = { ...playerRatingReportFixture, structuredJson: null, content: '純文字評級' };
    render(<PlayerRatingCard report={report} />);
    expect(screen.getByText('純文字評級')).toBeInTheDocument();
  });

  it('shows the not-generated state when report is null', () => {
    render(<PlayerRatingCard report={null} />);
    expect(screen.getByTestId('player-rating-card')).toHaveAttribute('data-state', 'idle');
  });
});
