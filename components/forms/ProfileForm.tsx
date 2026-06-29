'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/features/auth/auth-schemas';
import { useUpdateProfile } from '@/features/users/use-profile';
import { ApiError } from '@/lib/api-client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName,
      nickname: user.nickname ?? '',
      bio: user.bio ?? '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => update.mutate(v))}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      {/* email and role are read-only — role can never be changed here. */}
      <Input label="電子郵件" value={user.email} readOnly disabled />
      <Input label="角色" value={user.role} readOnly disabled />

      <Input label="顯示名稱" error={errors.displayName?.message} {...register('displayName')} />
      <Input label="暱稱" error={errors.nickname?.message} {...register('nickname')} />

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium text-slate-700">
          簡介
        </label>
        <textarea
          id="bio"
          rows={3}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          {...register('bio')}
        />
        {errors.bio?.message && <p className="text-sm text-red-600">{errors.bio.message}</p>}
      </div>

      {update.isSuccess && <p className="text-sm text-green-600">已更新基本資料。</p>}
      {update.error instanceof ApiError && (
        <p role="alert" className="text-sm text-red-600">
          {update.error.message}
        </p>
      )}

      <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
        儲存變更
      </Button>
    </form>
  );
}
