import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function RegisterPage() {
  const user = await getServerUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>註冊一般帳號</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-slate-500">註冊後預設為一般使用者 (USER)。</p>
          <RegisterForm />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-600">
        已經有帳號？{' '}
        <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
          登入
        </Link>
      </p>
    </div>
  );
}
