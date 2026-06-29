import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Never retry auth/permission errors — they won't resolve by retrying.
          if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
