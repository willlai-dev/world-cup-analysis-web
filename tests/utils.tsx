import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/features/auth/auth-store';
import { userFixtures } from '@/tests/mocks/fixtures';
import type { LocalRole } from '@/types/api';

export function setAuthRole(role: LocalRole) {
  if (role === 'GUEST') {
    useAuthStore.setState({ user: null, status: 'guest' });
    return;
  }
  const map = { USER: userFixtures.user, PREMIUM: userFixtures.premium, ADMIN: userFixtures.admin };
  useAuthStore.setState({ user: map[role], status: 'authenticated' });
}

export function renderWithProviders(ui: ReactElement) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}
