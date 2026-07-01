'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_DURATION_MS = 1250;

export function HomeEntranceSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(() => pathname === '/');

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9998 overflow-hidden bg-[radial-gradient(circle_at_top,#eff6ff_0%,#dbeafe_34%,#0f172a_100%)]"
    >
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,rgba(34,197,94,0)_0%,rgba(34,197,94,0.12)_20%,rgba(22,163,74,0.36)_100%)]" />
      <div className="absolute left-1/2 top-[58%] h-136 w-136 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/6 blur-2xl" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          <div className="home-splash-ring absolute inset-6 rounded-full border border-white/20" />
          <div className="home-splash-ring-delay absolute inset-0 rounded-full border border-white/12" />
          <div className="home-splash-pitch absolute bottom-10 left-1/2 h-24 w-64 -translate-x-1/2 rounded-[999px] border border-white/20 bg-white/8" />
          <div className="home-splash-shadow absolute bottom-12 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-slate-950/30 blur-md" />
          <div className="home-splash-ball relative flex h-28 w-28 items-center justify-center rounded-full bg-white text-5xl shadow-[0_18px_60px_rgba(15,23,42,0.45)] sm:h-32 sm:w-32 sm:text-6xl">
            <span className="translate-y-px">⚽</span>
          </div>
          <div className="home-splash-streak absolute top-1/2 h-1.5 w-44 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent via-white/80 to-transparent blur-[1px]" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-14 text-center text-white/92">
        <p className="text-xs font-medium uppercase tracking-[0.45em] text-brand-100/90">FIFA WORLD CUP</p>
        <p className="mt-3 text-2xl font-bold sm:text-3xl">Kickoff Intelligence</p>
      </div>
    </div>
  );
}