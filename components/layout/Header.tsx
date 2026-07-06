'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';
import { useAuth } from '@/features/auth/use-auth';
import { UserDropdown } from '@/components/layout/UserDropdown';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const APP_NAV = [
  { href: routes.matches, label: '賽事' },
  { href: routes.teams, label: '國家隊' },
  { href: routes.players, label: '球員' },
  { href: routes.championPredictions, label: '冠軍預測' },
  { href: routes.insights, label: '預測戰績' },
  { href: routes.news, label: '新聞' },
];

export function Header() {
  const { isAppUser, isGuest } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={routes.home} className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
            ⚽
          </span>
          <span className="hidden sm:inline">AI World Cup Analyst</span>
        </Link>

        {isAppUser && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="主導覽">
            {APP_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAppUser && <UserDropdown />}
          {isGuest && (
            <>
              <Link href={routes.login}>
                <Button variant="outline" size="sm">
                  登入
                </Button>
              </Link>
              <Link href={routes.register}>
                <Button size="sm">註冊</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {isAppUser && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {APP_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                  active ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
