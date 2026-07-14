'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@/features/auth/auth-api';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/auth-schemas';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordForm() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordFormValues) => forgotPassword(email),
    onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'EMAIL_SEND_COOLDOWN') {
        const details = error.details as { retryAfterSeconds?: unknown } | undefined;
        const retry =
          typeof details?.retryAfterSeconds === 'number' && details.retryAfterSeconds > 0
            ? Math.ceil(details.retryAfterSeconds)
            : RESEND_COOLDOWN_SECONDS;
        setCooldown(retry);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-slate-500">
        輸入註冊時使用的電子郵件，我們會寄送密碼重設連結（15 分鐘內有效）。
      </p>
      <Input
        label="電子郵件"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      {mutation.isSuccess && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {mutation.data.message}
        </p>
      )}
      {mutation.error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error.message}
        </p>
      )}

      <Button type="submit" isLoading={mutation.isPending} disabled={cooldown > 0} className="w-full">
        {cooldown > 0 ? `寄送重設連結（${cooldown} 秒後可再寄）` : '寄送重設連結'}
      </Button>
    </form>
  );
}
