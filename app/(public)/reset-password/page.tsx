import Link from 'next/link';
import { routes } from '@/lib/routes';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

// Reached from the password-reset mail link with ?token=…
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>重設密碼</CardTitle>
        </CardHeader>
        <CardBody>
          <ResetPasswordForm token={token} />
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
