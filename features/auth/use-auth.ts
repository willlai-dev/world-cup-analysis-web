'use client';

import { useAuthStore, roleFromUser } from '@/features/auth/auth-store';
import type { LocalRole } from '@/types/api';

export type UseAuth = {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  role: LocalRole;
  status: ReturnType<typeof useAuthStore.getState>['status'];
  isLoading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  isAppUser: boolean; // USER or PREMIUM
};

export function useAuth(): UseAuth {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const role = roleFromUser(user);

  return {
    user,
    role,
    status,
    isLoading: status === 'loading',
    isGuest: role === 'GUEST',
    isAdmin: role === 'ADMIN',
    isPremium: role === 'PREMIUM',
    isAppUser: role === 'USER' || role === 'PREMIUM',
  };
}
