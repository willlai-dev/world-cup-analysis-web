'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/auth-api';
import { useAuthStore } from '@/features/auth/auth-store';
import { routes } from '@/lib/routes';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: () => logout(),
    // Clear local state regardless of server outcome, then send to login.
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace(routes.login);
      router.refresh();
    },
  });
}
