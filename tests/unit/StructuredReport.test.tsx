import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StructuredReport } from '@/components/ai/StructuredReport';
import { COPY } from '@/lib/constants';

describe('StructuredReport', () => {
  it('renders labeled prose and lists without any raw JSON', () => {
    render(
      <StructuredReport
        data={{
          title: '賽事分析',
          summary: '兩隊勢均力敵。',
          keyFactors: ['主場優勢'],
          dataLimitations: ['樣本有限'],
        }}
      />,
    );
    expect(screen.getByText('賽事分析')).toBeInTheDocument();
    expect(screen.getByText('兩隊勢均力敵。')).toBeInTheDocument();
    expect(screen.getByText('主場優勢')).toBeInTheDocument();
    expect(screen.getByTestId('ai-estimate-hint')).toBeInTheDocument();
    // No JSON punctuation leaked to the user.
    expect(screen.queryByText(/[{}\[\]"]/)).not.toBeInTheDocument();
  });

  it('renders keyPlayers with reasons', () => {
    render(<StructuredReport data={{ keyPlayers: [{ name: 'Mbappe', reason: '速度' }] }} />);
    expect(screen.getByText('Mbappe')).toBeInTheDocument();
    expect(screen.getByText(/速度/)).toBeInTheDocument();
  });

  it('shows the insufficient copy for an object with nothing displayable', () => {
    render(<StructuredReport data={{ overallScore: 90, ratingTier: 'S' }} />);
    expect(screen.getByText(COPY.insufficientData)).toBeInTheDocument();
  });
});
