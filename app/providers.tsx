'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/features/auth/AuthProvider';
import type { User } from '@/types/api';

type ProvidersProps = {
  initialUser: User | null;
  children: React.ReactNode;
};

export function Providers({ initialUser, children }: ProvidersProps) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
