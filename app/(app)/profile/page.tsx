'use client';

import { useProfile } from '@/features/users/use-profile';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { LoadingState, ErrorState } from '@/components/ui/states';

export default function ProfilePage() {
  const profile = useProfile();

  return (
    <div>
      <PageHeading title="基本資料" description="管理您的顯示名稱、暱稱與簡介。" />
      {profile.isLoading ? (
        <LoadingState />
      ) : profile.isError ? (
        <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
      ) : profile.data ? (
        <Card>
          <CardBody>
            <ProfileForm user={profile.data} />
          </CardBody>
        </Card>
      ) : (
        <ErrorState />
      )}
    </div>
  );
}
