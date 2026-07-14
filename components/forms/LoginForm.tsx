'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { login } from '@/features/auth/auth-api';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth-schemas';
import { stashPendingVerificationEmail } from '@/features/auth/pending-verification';
import { useAuthStore } from '@/features/auth/auth-store';
import { ROLE_HOME } from '@/lib/constants';
import { ApiError } from '@/lib/api-client';
import { routes } from '@/lib/routes';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import type { LoginResponse } from '@/types/api';

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

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
    onError: (error, variables) => {
      // Correct credentials but unverified email — send them to the verify page.
      // The email travels via sessionStorage, never the URL (PII in history/logs).
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        stashPendingVerificationEmail(variables.email);
        router.replace(routes.verifyEmail);
      }
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
      <PasswordInput
        label="密碼"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {mutation.error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error.code === 'EMAIL_NOT_VERIFIED'
            ? 'Email 尚未完成驗證，正在前往驗證頁…'
            : mutation.error.isUnauthorized
              ? '電子郵件或密碼不正確。'
              : mutation.error.message}
        </p>
      )}

      <div className="flex justify-end">
        <Link
          href={routes.forgotPassword}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          忘記密碼？
        </Link>
      </div>

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        登入
      </Button>
    </form>
  );
}
