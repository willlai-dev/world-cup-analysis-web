'use client';

import { useRouter } from 'next/navigation';
import { useCreateAdminUser } from '@/features/admin/use-admin';
import { routes } from '@/lib/routes';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { AdminCreateUserForm } from '@/components/forms/AdminCreateUserForm';

export default function AdminCreateAccountPage() {
  const router = useRouter();
  const create = useCreateAdminUser();

  return (
    <div className="max-w-lg">
      <PageHeading title="新增帳號" description="建立 USER / PREMIUM / ADMIN 帳號。" />
      <Card>
        <CardBody>
          <AdminCreateUserForm
            isPending={create.isPending}
            error={create.error}
            onSubmit={(values) =>
              create.mutate(values, { onSuccess: () => router.push(routes.admin.accounts) })
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
