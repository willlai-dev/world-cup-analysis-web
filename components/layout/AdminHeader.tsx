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
  { href: routes.admin.jobs, label: '資料更新' },
  { href: routes.admin.aiUsage, label: 'AI 用量' },
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
        <div className="flex min-w-0 items-center gap-6">
          <span className="whitespace-nowrap font-bold">⚙️ Admin Console</span>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Admin 導覽">
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

        <div className="flex shrink-0 items-center gap-3">
          {user && (
            <span className="hidden max-w-32 truncate text-sm text-slate-300 sm:inline">
              {user.displayName}
            </span>
          )}
          {/* secondary (dark) variant: no bg/text conflict with this header —
              cn() doesn't merge Tailwind utilities, so overrides are unreliable. */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logout.mutate()}
            isLoading={logout.isPending}
            className="border border-slate-600"
          >
            登出
          </Button>
        </div>
      </div>

      {/* Mobile nav: same items in a horizontally scrollable second row. */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-slate-800 px-4 py-2 md:hidden"
        aria-label="Admin 行動版導覽"
      >
        {ADMIN_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                active ? 'bg-slate-700 font-medium text-white' : 'text-slate-300',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
