'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';
import { fetchMe } from '@/features/auth/auth-api';
import { useAuthStore } from '@/features/auth/auth-store';
import type { User } from '@/types/api';

type AuthProviderProps = {
  // Resolved server-side via getServerUser() so first paint already knows the role.
  initialUser: User | null;
  children: React.ReactNode;
};

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const setUser = useAuthStore((s) => s.setUser);

  // Seed the store synchronously on first render so guards/headers are correct immediately.
  if (useAuthStore.getState().status === 'loading') {
    useAuthStore.setState({
      user: initialUser,
      status: initialUser ? 'authenticated' : 'guest',
    });
  }

  // Keep the store fresh across client navigations; tolerate 401 as "guest".
  const { data, error, isSuccess } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => fetchMe(signal),
    initialData: initialUser ?? undefined,
    retry: (count, err) =>
      !(err instanceof ApiError && err.isUnauthorized) && count < 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isSuccess) setUser(data ?? null);
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (error instanceof ApiError && error.isUnauthorized) {
      setUser(null);
    }
  }, [error, setUser]);

  return <>{children}</>;
}
