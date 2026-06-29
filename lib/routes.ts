import type { LocalRole } from '@/types/api';

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  matches: '/matches',
  match: (id: string) => `/matches/${id}`,
  teams: '/teams',
  team: (id: string) => `/teams/${id}`,
  players: '/players',
  player: (id: string) => `/players/${id}`,
  championPredictions: '/champion-predictions',
  news: '/news',
  newsItem: (id: string) => `/news/${id}`,
  profile: '/profile',
  favorites: '/favorites',
  admin: {
    accounts: '/admin/accounts',
    createAccount: '/admin/accounts/create',
    registerAdmin: '/admin/register-admin',
  },
} as const;

export const PUBLIC_ROUTES = ['/', '/login', '/register'];

export const ADMIN_ROUTE_PREFIX = '/admin';

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`);
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

// Whether `role` may access `pathname`. Mirrors 04_FRONTEND_AUTH_RBAC_SPEC.md.
export function canAccess(role: LocalRole, pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    // Logged-in users get redirected away from /login & /register by the guards,
    // but the route itself is "accessible" (home is shared).
    return true;
  }
  if (isAdminRoute(pathname)) {
    return role === 'ADMIN';
  }
  // All remaining app routes are USER/PREMIUM only.
  return role === 'USER' || role === 'PREMIUM';
}
