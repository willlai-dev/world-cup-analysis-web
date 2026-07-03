'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/features/auth/auth-api';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth-schemas';
import { useAuthStore } from '@/features/auth/auth-store';
import { ROLE_HOME } from '@/lib/constants';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { LoginResponse } from '@/types/api';

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

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const passwordInputId = useId();
  const passwordErrorId = `${passwordInputId}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: (data: LoginResponse) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
      // Prefer backend redirectPath; fall back to role-based home.
      const target = data.redirectPath ?? ROLE_HOME[data.user.role];
      router.replace(target);
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4" noValidate>
      <Input
        label="電子郵件"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={passwordInputId} className="text-sm font-medium text-slate-700">
          密碼
        </label>
        <div className="relative">
          <input
            id={passwordInputId}
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            className={cn(
              'h-10 w-full rounded-md border bg-white px-3 pr-12 text-sm text-slate-900 shadow-sm',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              errors.password ? 'border-red-400' : 'border-slate-300',
            )}
            {...register('password')}
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? '放開以隱藏密碼' : '按住以顯示密碼'}
            aria-pressed={isPasswordVisible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
            onPointerDown={(event) => {
              event.preventDefault();
              setIsPasswordVisible(true);
            }}
            onPointerUp={() => setIsPasswordVisible(false)}
            onPointerCancel={() => setIsPasswordVisible(false)}
            onPointerLeave={() => setIsPasswordVisible(false)}
            onBlur={() => setIsPasswordVisible(false)}
            onKeyDown={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                setIsPasswordVisible(true);
              }
            }}
            onKeyUp={() => setIsPasswordVisible(false)}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
        {errors.password && (
          <p id={passwordErrorId} role="alert" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {mutation.error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error.isUnauthorized ? '電子郵件或密碼不正確。' : mutation.error.message}
        </p>
      )}

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        登入
      </Button>
    </form>
  );
}
