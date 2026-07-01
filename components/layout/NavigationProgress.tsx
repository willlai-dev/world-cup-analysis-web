'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Thin top-of-page progress bar that shows during client-side navigation.
 * - Starts when any internal <a href> is clicked
 * - Increments pseudo-randomly up to ~94%
 * - Snaps to 100% when the pathname changes, then fades out
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const prevPath = useRef(pathname);
  const tickRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const doneRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const widthRef = useRef(0);

  function start() {
    clearInterval(tickRef.current);
    clearTimeout(doneRef.current);
    widthRef.current = 15;
    setVisible(true);
    setWidth(15);
    tickRef.current = setInterval(() => {
      const w = widthRef.current;
      const next =
        w < 65
          ? w + Math.random() * 10 + 4
          : w < 85
            ? w + Math.random() * 3 + 1
            : w < 93
              ? w + Math.random() * 0.8
              : w;
      widthRef.current = Math.min(next, 94);
      setWidth(widthRef.current);
    }, 350);
  }

  function finish() {
    clearInterval(tickRef.current);
    widthRef.current = 100;
    setWidth(100);
    doneRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
      widthRef.current = 0;
    }, 450);
  }

  // Detect link click → start bar
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      // Skip external, hash, mailto, tel
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      )
        return;
      // Skip same page
      const destPath = href.split('?')[0];
      const currPath = pathname.split('?')[0];
      if (destPath === currPath) return;
      start();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Detect route completion → finish bar
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      clearInterval(tickRef.current);
      clearTimeout(doneRef.current);
    },
    [],
  );

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="頁面載入中"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="pointer-events-none fixed left-0 top-0 z-9999 h-0.75 transition-[width,opacity] duration-300 ease-out"
      style={{
        width: `${width}%`,
        opacity: width >= 100 ? 0 : 1,
        background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 60%, #93c5fd 100%)',
        boxShadow: '0 0 8px 1px rgba(96,165,250,0.6)',
      }}
    />
  );
}
