import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/tests/mocks/server';
import { useAuthStore } from '@/features/auth/auth-store';
import { useChatStore } from '@/features/ai/chat-store';

// next/navigation is server-aware; stub it for component unit tests.
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  redirect: vi.fn(),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Reset auth state so role-based component tests don't leak into each other.
  useAuthStore.setState({ user: null, status: 'guest' });
  // The chat store is a module singleton; clear the thread between tests.
  useChatStore.getState().reset();
});

afterAll(() => server.close());
