'use client';

import { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label?: string;
  error?: string;
};

/**
 * Password field with a press-and-hold "reveal" affordance: the value is shown
 * only while the eye button is held down (pointer or Space/Enter), and hidden
 * again on release/blur. Forwards its ref so react-hook-form `register()` works.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, className, id, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isVisible ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'h-10 w-full rounded-md border bg-white px-3 pr-12 text-sm text-slate-900 shadow-sm',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              error ? 'border-red-400' : 'border-slate-300',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            aria-label={isVisible ? '放開以隱藏密碼' : '按住以顯示密碼'}
            aria-pressed={isVisible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
            onPointerDown={(event) => {
              event.preventDefault();
              setIsVisible(true);
            }}
            onPointerUp={() => setIsVisible(false)}
            onPointerCancel={() => setIsVisible(false)}
            onPointerLeave={() => setIsVisible(false)}
            onBlur={() => setIsVisible(false)}
            onKeyDown={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                setIsVisible(true);
              }
            }}
            onKeyUp={() => setIsVisible(false)}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);
