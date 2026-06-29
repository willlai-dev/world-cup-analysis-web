'use client';

import { useRouter } from 'next/navigation';
import { useRegisterAdmin } from '@/features/admin/use-admin';
import { routes } from '@/lib/routes';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { AdminCreateUserForm } from '@/components/forms/AdminCreateUserForm';

export default function RegisterAdminPage() {
  const router = useRouter();
  const registerAdmin = useRegisterAdmin();

  return (
    <div className="max-w-lg">
      <PageHeading title="註冊 Admin" description="新增一位管理員帳號。" />
      <Card>
        <CardBody>
          <AdminCreateUserForm
            lockRole="ADMIN"
            submitLabel="建立 Admin"
            isPending={registerAdmin.isPending}
            error={registerAdmin.error}
            onSubmit={(values) =>
              registerAdmin.mutate(values, {
                onSuccess: () => router.push(routes.admin.accounts),
              })
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
