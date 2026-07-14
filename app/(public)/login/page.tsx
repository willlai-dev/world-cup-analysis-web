import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { LoginForm } from '@/components/forms/LoginForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; verified?: string; reset?: string }>;
}) {
  // Already-authenticated users never see the login form.
  const user = await getServerUser();
  if (user) redirect(ROLE_HOME[user.role]);

  const { registered, verified, reset } = await searchParams;
  const banner = verified
    ? 'Email 驗證成功，請登入。'
    : reset
      ? '密碼已重設成功，請使用新密碼登入。'
      : registered
        ? '註冊成功，請使用您的帳號登入。'
        : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>登入</CardTitle>
        </CardHeader>
        <CardBody>
          {banner && (
            <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {banner}
            </p>
          )}
          <LoginForm />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-600">
        還沒有帳號？{' '}
        <Link href={routes.register} className="font-medium text-brand-700 hover:underline">
          註冊
        </Link>
      </p>
    </div>
  );
}
