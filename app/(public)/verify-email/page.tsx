import Link from 'next/link';
import { routes } from '@/lib/routes';
import { VerifyEmailPanel } from '@/components/forms/VerifyEmailPanel';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

// Reached (1) from the mail link with ?token=…, or (2) from register/login
// redirects with ?email=… when the account still needs verification.
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Email 驗證</CardTitle>
        </CardHeader>
        <CardBody>
          <VerifyEmailPanel token={token} email={email} />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-600">
        已完成驗證？{' '}
        <Link href={routes.login} className="font-medium text-brand-700 hover:underline">
          前往登入
        </Link>
      </p>
    </div>
  );
}
