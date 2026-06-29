import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { getServerUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'AI World Cup Analyst',
  description: 'AI 世足分析網站 — 賽事、國家隊、球員、冠軍預測與新聞分析。',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve identity once on the server so providers/guards start with the real role.
  const initialUser = await getServerUser();

  return (
    <html lang="zh-Hant">
      <body>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
