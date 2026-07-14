'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { register as registerUser } from '@/features/auth/auth-api';
import { registerSchema, type RegisterFormValues } from '@/features/auth/auth-schemas';
import { routes } from '@/lib/routes';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    // New accounts always default to USER server-side; role is never selectable here.
    mutationFn: ({ email, displayName, password }: RegisterFormValues) =>
      registerUser({ email, displayName, password }),
    onSuccess: (_data, variables) => {
      // The account starts unverified — a verification mail is on its way.
      router.replace(`${routes.verifyEmail}?email=${encodeURIComponent(variables.email)}`);
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
      <Input label="顯示名稱" error={errors.displayName?.message} {...register('displayName')} />
      <PasswordInput
        label="密碼"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        label="確認密碼"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {mutation.error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error.message}
        </p>
      )}

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        註冊
      </Button>
    </form>
  );
}
