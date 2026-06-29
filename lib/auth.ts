import 'server-only';
import { cookies } from 'next/headers';
import { apiData, ApiError } from '@/lib/api-client';
import type { LocalRole, User } from '@/types/api';

// Server-side auth resolution. Forwards the incoming cookie header to the backend
// /auth/me — the backend remains the single source of truth for identity & role.
// Returns null when the visitor is a guest (401) so callers can treat them as GUEST.
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    return await apiData<User>('/auth/me', {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      return null;
    }
    // For any other failure, fail closed (treat as guest) rather than leak access.
    return null;
  }
}

export async function getServerRole(): Promise<LocalRole> {
  const user = await getServerUser();
  return user?.role ?? 'GUEST';
}
