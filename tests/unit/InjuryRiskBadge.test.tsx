import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InjuryRiskBadge } from '@/components/ai/InjuryRiskBadge';

describe('InjuryRiskBadge', () => {
  it('renders a labelled badge for a known level', () => {
    render(<InjuryRiskBadge level="HIGH" />);
    expect(screen.getByTestId('injury-risk-badge')).toHaveTextContent('傷病風險 高');
  });

  it('omits the label when showLabel is false', () => {
    render(<InjuryRiskBadge level="LOW" showLabel={false} />);
    expect(screen.getByTestId('injury-risk-badge')).toHaveTextContent('低');
    expect(screen.getByTestId('injury-risk-badge')).not.toHaveTextContent('傷病風險');
  });

  it('renders nothing when level is missing', () => {
    render(<InjuryRiskBadge level={null} />);
    expect(screen.queryByTestId('injury-risk-badge')).not.toBeInTheDocument();
  });
});
