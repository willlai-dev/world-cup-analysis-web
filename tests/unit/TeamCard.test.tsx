import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { TeamCard } from '@/components/cards/TeamCard';
import { teamFixtures } from '@/tests/mocks/fixtures';
import { renderWithProviders } from '@/tests/utils';

describe('TeamCard elimination badge', () => {
  it('shows the 已淘汰 badge when the team is eliminated', () => {
    renderWithProviders(<TeamCard team={{ ...teamFixtures[0], isEliminated: true }} />);
    expect(screen.getByText('已淘汰')).toBeInTheDocument();
  });

  it('does not show the 已淘汰 badge when the team is still in', () => {
    renderWithProviders(<TeamCard team={{ ...teamFixtures[0], isEliminated: false }} />);
    expect(screen.queryByText('已淘汰')).not.toBeInTheDocument();
  });
});
