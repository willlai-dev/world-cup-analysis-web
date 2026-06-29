'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/features/auth/auth-api';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth-schemas';
import { useAuthStore } from '@/features/auth/auth-store';
import { ROLE_HOME } from '@/lib/constants';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
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
      <Input
        label="密碼"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

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
