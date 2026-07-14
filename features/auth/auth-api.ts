import { apiData } from '@/lib/api-client';
import type {
  AuthActionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  User,
} from '@/types/api';

export function fetchMe(signal?: AbortSignal): Promise<User> {
  return apiData<User>('/auth/me', { signal });
}

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiData<LoginResponse>('/auth/login', { method: 'POST', body });
}

// Registration leaves the account unverified — callers route to /verify-email.
export function register(body: RegisterRequest): Promise<RegisterResponse> {
  return apiData<RegisterResponse>('/auth/register', { method: 'POST', body });
}

export function verifyEmail(token: string): Promise<AuthActionResponse> {
  return apiData<AuthActionResponse>('/auth/verify-email', { method: 'POST', body: { token } });
}

export function resendVerification(email: string): Promise<AuthActionResponse> {
  return apiData<AuthActionResponse>('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}

// Response is identical whether or not the email exists (anti-enumeration).
export function forgotPassword(email: string): Promise<AuthActionResponse> {
  return apiData<AuthActionResponse>('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword(body: ResetPasswordRequest): Promise<AuthActionResponse> {
  return apiData<AuthActionResponse>('/auth/reset-password', { method: 'POST', body });
}

export function logout(): Promise<unknown> {
  return apiData('/auth/logout', { method: 'POST' });
}
