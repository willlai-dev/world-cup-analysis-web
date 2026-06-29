import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

describe('Header by role', () => {
  it('shows login/register for guests and hides app nav', () => {
    setAuthRole('GUEST');
    renderWithProviders(<Header />);
    expect(screen.getByText('登入')).toBeInTheDocument();
    expect(screen.getByText('註冊')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '主導覽' })).not.toBeInTheDocument();
  });

  it('shows main nav for USER', () => {
    setAuthRole('USER');
    renderWithProviders(<Header />);
    expect(screen.getByRole('navigation', { name: '主導覽' })).toBeInTheDocument();
    expect(screen.getAllByText('賽事').length).toBeGreaterThan(0);
    expect(screen.queryByText('登入')).not.toBeInTheDocument();
  });

  it('shows main nav for PREMIUM', () => {
    setAuthRole('PREMIUM');
    renderWithProviders(<Header />);
    expect(screen.getByRole('navigation', { name: '主導覽' })).toBeInTheDocument();
  });
});
