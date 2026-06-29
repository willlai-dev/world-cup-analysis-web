'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from '@/features/users/users-api';
import { useAuthStore } from '@/features/auth/auth-store';

export const profileKey = ['users', 'me'] as const;

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: ({ signal }) => fetchProfile(signal) });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(profileKey, user);
      queryClient.setQueryData(['auth', 'me'], user);
      setUser(user);
    },
  });
}
