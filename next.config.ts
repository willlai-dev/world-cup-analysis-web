import type { NextConfig } from 'next';

// Same-origin proxy: the browser calls `/api/*` on the frontend origin and Next
// forwards to the real backend (NEXT_PUBLIC_BACKEND_API_URL). This keeps the auth
// cookie first-party to the frontend so both client fetches and the server-side
// layout guards (getServerUser) can read it. No secrets are introduced.
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:3000/api';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_API_URL}/:path*` }];
  },
};

export default nextConfig;
