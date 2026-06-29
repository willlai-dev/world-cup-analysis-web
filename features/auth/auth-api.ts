import { apiData } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '@/types/api';

export function fetchMe(signal?: AbortSignal): Promise<User> {
  return apiData<User>('/auth/me', { signal });
}

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiData<LoginResponse>('/auth/login', { method: 'POST', body });
}

export function register(body: RegisterRequest): Promise<User> {
  return apiData<User>('/auth/register', { method: 'POST', body });
}

export function logout(): Promise<unknown> {
  return apiData('/auth/logout', { method: 'POST' });
}
