import type { NextConfig } from 'next';

// Same-origin proxy: the browser calls `/api/*` on the frontend origin and Next
// forwards to the real backend (NEXT_PUBLIC_BACKEND_API_URL). This keeps the auth
// cookie first-party to the frontend so both client fetches and the server-side
// layout guards (getServerUser) can read it. No secrets are introduced.
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:3000/api';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Use `fallback` so any Route Handlers under app/api/ take precedence over
    // this catch-all proxy. Without fallback, Next.js "afterFiles" rewrites run
    // before dynamic routes and would shadow Route Handlers (e.g. the translate
    // and ai/chat handlers that need a longer 120-second timeout to avoid the
    // default ~30-second proxy socket timeout on dev-server rewrites).
    return {
      fallback: [{ source: '/api/:path*', destination: `${BACKEND_API_URL}/:path*` }],
    };
  },
};

export default nextConfig;
