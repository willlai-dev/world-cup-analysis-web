'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';
import { useAuth } from '@/features/auth/use-auth';
import { useLogout } from '@/features/auth/use-logout';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { href: routes.admin.accounts, label: '帳號管理' },
  { href: routes.admin.registerAdmin, label: '註冊 Admin' },
];

// Admin layout is fully isolated: no main nav, no floating chat, no favorites.
export function AdminHeader() {
  const { user } = useAuth();
  const logout = useLogout();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-700 bg-slate-900 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <span className="font-bold">⚙️ Admin Console</span>
          <nav className="flex items-center gap-1" aria-label="Admin 導覽">
            {ADMIN_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-slate-300">{user.displayName}</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            isLoading={logout.isPending}
            className="border-slate-600 bg-transparent text-white hover:bg-slate-800"
          >
            登出
          </Button>
        </div>
      </div>
    </header>
  );
}
