import { apiData } from '@/lib/api-client';
import type { UpdateMeRequest, User } from '@/types/api';

export function fetchProfile(signal?: AbortSignal): Promise<User> {
  return apiData<User>('/users/me', { signal });
}

export function updateProfile(body: UpdateMeRequest): Promise<User> {
  return apiData<User>('/users/me', { method: 'PATCH', body });
}
