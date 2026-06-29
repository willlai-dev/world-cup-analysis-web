'use client';

import { useAuth } from '@/features/auth/use-auth';
import type { LocalRole } from '@/types/api';

type RoleGateProps = {
  allow: LocalRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

// UI-only visibility control. The backend remains the authority on permissions;
// this never replaces the layout server guards or backend 401/403 handling.
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { role } = useAuth();
  if (!allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

// Convenience wrapper for PREMIUM-only entry points (translation, deep chat, recalc).
export function PremiumOnly({ children, fallback = null }: Omit<RoleGateProps, 'allow'>) {
  return (
    <RoleGate allow={['PREMIUM']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
