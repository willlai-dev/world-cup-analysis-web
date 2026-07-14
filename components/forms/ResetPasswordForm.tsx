'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/features/auth/auth-api';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/auth-schemas';
import { ApiError } from '@/lib/api-client';
import { routes } from '@/lib/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const TOKEN_ERROR_CODES = new Set([
  'PASSWORD_RESET_TOKEN_INVALID',
  'PASSWORD_RESET_TOKEN_EXPIRED',
  'PASSWORD_RESET_TOKEN_USED',
]);

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({
        token: token ?? '',
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: () => {
      // Reset never auto-logs-in — back to the login page with a banner.
      router.replace(`${routes.login}?reset=1`);
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          重設連結無效或不完整，請重新申請。
        </p>
        <Link
          href={routes.forgotPassword}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          重新申請密碼重設
        </Link>
      </div>
    );
  }

  const tokenError =
    mutation.error instanceof ApiError && TOKEN_ERROR_CODES.has(mutation.error.code);

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4" noValidate>
      <Input
        label="新密碼"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="確認新密碼"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {mutation.error instanceof ApiError && (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm text-red-600">
            {mutation.error.message}
          </p>
          {tokenError && (
            <Link
              href={routes.forgotPassword}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              重新申請密碼重設
            </Link>
          )}
        </div>
      )}

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        設定新密碼
      </Button>
    </form>
  );
}
