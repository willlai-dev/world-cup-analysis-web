import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Public shell for /, /login, /register. Header is role-aware so a logged-in
// user visiting "/" still sees their nav. No server guard: these routes are open.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
