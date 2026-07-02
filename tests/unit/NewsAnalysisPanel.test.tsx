import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsAnalysisPanel } from '@/components/ai/NewsAnalysisPanel';
import { newsAnalysisReportFixture } from '@/tests/mocks/fixtures';
import type { AiReport } from '@/types/api';

describe('NewsAnalysisPanel', () => {
  it('hides entirely when there is no report (null-tolerant)', () => {
    const { container } = render(<NewsAnalysisPanel report={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides when the report is not DONE', () => {
    const failed: AiReport = { ...newsAnalysisReportFixture, status: 'FAILED' };
    const { container } = render(<NewsAnalysisPanel report={failed} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders summary, affected entities, direction badges and the inference note', () => {
    render(<NewsAnalysisPanel report={newsAnalysisReportFixture} />);

    expect(screen.getByTestId('news-analysis-panel')).toBeInTheDocument();
    expect(screen.getByText('AI 推論，僅供參考')).toBeInTheDocument();
    expect(screen.getByText(/影響法國中場輪換/)).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Mbappe')).toBeInTheDocument();
    // Direction badges: NEGATIVE (負向) for the team, UNKNOWN (未知) for the player.
    expect(screen.getByText('負向')).toBeInTheDocument();
    expect(screen.getByText('未知')).toBeInTheDocument();
  });
});
