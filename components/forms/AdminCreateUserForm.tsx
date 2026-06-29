'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminCreateUserSchema,
  type AdminCreateUserFormValues,
} from '@/features/auth/auth-schemas';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types/api';

const ROLE_OPTIONS = [
  { label: '一般使用者 (USER)', value: 'USER' },
  { label: '高級使用者 (PREMIUM)', value: 'PREMIUM' },
  { label: '管理員 (ADMIN)', value: 'ADMIN' },
];

type AdminCreateUserFormProps = {
  onSubmit: (values: AdminCreateUserFormValues) => void;
  isPending?: boolean;
  error?: unknown;
  // When set, the role is fixed (e.g. register-admin) and the select is hidden.
  lockRole?: UserRole;
  submitLabel?: string;
};

export function AdminCreateUserForm({
  onSubmit,
  isPending,
  error,
  lockRole,
  submitLabel = '建立帳號',
}: AdminCreateUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCreateUserFormValues>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: { role: lockRole ?? 'USER' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="電子郵件"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input label="顯示名稱" error={errors.displayName?.message} {...register('displayName')} />
      <Input
        label="密碼"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      {lockRole ? (
        <input type="hidden" value={lockRole} {...register('role')} />
      ) : (
        <Select
          label="角色"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role')}
        />
      )}

      {error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {error.isForbidden ? '你沒有權限執行此操作。' : error.message}
        </p>
      )}

      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
