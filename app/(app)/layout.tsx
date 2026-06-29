import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingChatButton } from '@/components/ai/FloatingChatButton';

// Authoritative guard for USER/PREMIUM pages. ADMIN and guests are redirected
// here on the server before any content renders (no flash, real role check).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) redirect(routes.login);
  if (user.role === 'ADMIN') redirect(ROLE_HOME.ADMIN);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
}
