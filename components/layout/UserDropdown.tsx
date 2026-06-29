'use client';

import { useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import { useAuth } from '@/features/auth/use-auth';
import { useLogout } from '@/features/auth/use-logout';
import { cn } from '@/lib/utils';

export function UserDropdown() {
  const { user, isPremium } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[8rem] truncate">{user.displayName}</span>
        {isPremium && <span className="text-xs text-purple-600">PREMIUM</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          >
            <DropdownLink href={routes.profile} onClick={() => setOpen(false)}>
              基本資料
            </DropdownLink>
            <DropdownLink href={routes.favorites} onClick={() => setOpen(false)}>
              關注名單
            </DropdownLink>
            <button
              role="menuitem"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 disabled:opacity-50"
            >
              登出
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DropdownLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className={cn('block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50')}
    >
      {children}
    </Link>
  );
}
