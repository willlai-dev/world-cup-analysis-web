'use client';

import { useAuth } from '@/features/auth/use-auth';
import { Badge } from '@/components/ui/Badge';
import { COPY } from '@/lib/constants';
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

// Convenience wrapper for PREMIUM-only entry points where we simply hide content.
export function PremiumOnly({ children, fallback = null }: Omit<RoleGateProps, 'allow'>) {
  return (
    <RoleGate allow={['PREMIUM']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

// PREMIUM-only feature that, for non-PREMIUM viewers (i.e. USER on app pages),
// renders a plain "you can't use this" notice instead of hiding it entirely.
export function PremiumGate({
  feature,
  children,
}: {
  feature: string;
  children: React.ReactNode;
}) {
  const { isPremium } = useAuth();
  if (isPremium) return <>{children}</>;
  return (
    <div
      data-testid="premium-locked"
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-center gap-2">
        <Badge tone="premium">PREMIUM</Badge>
        <span className="text-sm font-medium text-slate-700">{feature}</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{COPY.forbidden}</p>
    </div>
  );
}
