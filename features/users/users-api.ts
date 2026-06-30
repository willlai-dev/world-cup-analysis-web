import { apiData } from '@/lib/api-client';
import type { MeDto, UpdateMeRequest } from '@/types/api';

// GET/PATCH /users/me return MeDto (UserDto + nested profile | null).
export function fetchProfile(signal?: AbortSignal): Promise<MeDto> {
  return apiData<MeDto>('/users/me', { signal });
}

export function updateProfile(body: UpdateMeRequest): Promise<MeDto> {
  return apiData<MeDto>('/users/me', { method: 'PATCH', body });
}
