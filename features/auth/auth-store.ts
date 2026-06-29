import { create } from 'zustand';
import type { LocalRole, User } from '@/types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

type AuthState = {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'guest' }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: 'guest' }),
}));

export function roleFromUser(user: User | null): LocalRole {
  return user?.role ?? 'GUEST';
}
