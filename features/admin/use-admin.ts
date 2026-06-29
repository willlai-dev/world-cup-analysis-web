'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminUser,
  deleteUser,
  fetchAdminUsers,
  registerAdmin,
  updateUserRole,
  type AdminUserListParams,
} from '@/features/admin/admin-api';

const adminUsersKey = (params: AdminUserListParams) => ['admin', 'users', params] as const;

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUsersKey(params),
    queryFn: ({ signal }) => fetchAdminUsers(params, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAdminUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
}

export function useCreateAdminUser() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({ mutationFn: createAdminUser, onSuccess: invalidate });
}

export function useRegisterAdmin() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({ mutationFn: registerAdmin, onSuccess: invalidate });
}

export function useUpdateUserRole() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'PREMIUM' | 'ADMIN' }) =>
      updateUserRole(userId, { role }),
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({ mutationFn: (userId: string) => deleteUser(userId), onSuccess: invalidate });
}
