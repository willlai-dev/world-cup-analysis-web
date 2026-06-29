import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { AdminHeader } from '@/components/layout/AdminHeader';

// Authoritative guard for /admin/*. Only ADMIN may enter; everyone else is sent
// to their own home. No main nav and no floating chat in this shell.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) redirect(routes.login);
  if (user.role !== 'ADMIN') redirect(ROLE_HOME[user.role]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
