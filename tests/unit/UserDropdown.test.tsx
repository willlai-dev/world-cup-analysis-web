import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDropdown } from '@/components/layout/UserDropdown';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

describe('UserDropdown by role', () => {
  it('renders nothing for guests', () => {
    setAuthRole('GUEST');
    const { container } = renderWithProviders(<UserDropdown />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows profile, favorites and logout for USER', async () => {
    setAuthRole('USER');
    renderWithProviders(<UserDropdown />);
    await userEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('menuitem', { name: '基本資料' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '關注名單' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '登出' })).toBeInTheDocument();
  });

  it('flags PREMIUM users', () => {
    setAuthRole('PREMIUM');
    renderWithProviders(<UserDropdown />);
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });
});
