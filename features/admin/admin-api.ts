import { apiFetch, apiData, getPagination } from '@/lib/api-client';
import type {
  AdminCreateUserRequest,
  AdminUpdateRoleRequest,
  PaginationMeta,
  User,
  UserRole,
  UserStatus,
} from '@/types/api';

export type AdminUserListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
};

export type AdminUserListResult = {
  users: User[];
  pagination?: PaginationMeta;
};

export async function fetchAdminUsers(
  params: AdminUserListParams,
  signal?: AbortSignal,
): Promise<AdminUserListResult> {
  const { data, meta } = await apiFetch<User[]>('/admin/users', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      role: params.role || undefined,
      status: params.status || undefined,
    },
    signal,
  });
  return { users: data, pagination: getPagination(meta) };
}

export function createAdminUser(body: AdminCreateUserRequest): Promise<User> {
  return apiData<User>('/admin/users', { method: 'POST', body });
}

export function updateUserRole(userId: string, body: AdminUpdateRoleRequest): Promise<User> {
  return apiData<User>(`/admin/users/${userId}/role`, { method: 'PATCH', body });
}

export function deleteUser(userId: string): Promise<unknown> {
  return apiData(`/admin/users/${userId}`, { method: 'DELETE' });
}

export function registerAdmin(body: AdminCreateUserRequest): Promise<User> {
  return apiData<User>('/admin/register-admin', { method: 'POST', body });
}
