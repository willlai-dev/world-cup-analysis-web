import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function ForgotPasswordPage() {
  // Logged-in users have no use for this page.
  const user = await getServerUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>忘記密碼</CardTitle>
        </CardHeader>
        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-600">
        想起密碼了？{' '}
        <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
          回到登入
        </Link>
      </p>
    </div>
  );
}
