import { describe, it, expect } from 'vitest';
import { canAccess, isAdminRoute, isPublicRoute } from '@/lib/routes';

describe('route RBAC helpers', () => {
  it('classifies public and admin routes', () => {
    expect(isPublicRoute('/')).toBe(true);
    expect(isPublicRoute('/login')).toBe(true);
    expect(isAdminRoute('/admin/accounts')).toBe(true);
    expect(isAdminRoute('/matches')).toBe(false);
  });

  it('guests can only reach public routes', () => {
    expect(canAccess('GUEST', '/')).toBe(true);
    expect(canAccess('GUEST', '/matches')).toBe(false);
    expect(canAccess('GUEST', '/admin/accounts')).toBe(false);
  });

  it('USER and PREMIUM reach app routes but not admin', () => {
    for (const role of ['USER', 'PREMIUM'] as const) {
      expect(canAccess(role, '/matches')).toBe(true);
      expect(canAccess(role, '/favorites')).toBe(true);
      expect(canAccess(role, '/admin/accounts')).toBe(false);
    }
  });

  it('ADMIN reaches admin routes but not app routes', () => {
    expect(canAccess('ADMIN', '/admin/accounts')).toBe(true);
    expect(canAccess('ADMIN', '/matches')).toBe(false);
  });
});
