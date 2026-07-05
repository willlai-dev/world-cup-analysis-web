import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import AdminAiUsagePage from '@/app/(admin)/admin/ai-usage/page';
import { server } from '@/tests/mocks/server';
import { API, ok } from '@/tests/mocks/handlers';
import { aiUsageFixture } from '@/tests/mocks/fixtures';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

describe('AdminAiUsagePage', () => {
  it('renders totals, breakdown bars and the top-users table', async () => {
    setAuthRole('ADMIN');
    server.use(http.get(`${API}/admin/ai-usage`, () => ok(aiUsageFixture)));

    renderWithProviders(<AdminAiUsagePage />);

    await waitFor(() => expect(screen.getByText('總呼叫次數')).toBeInTheDocument());

    // Totals tiles.
    expect(screen.getByText('120')).toBeInTheDocument(); // calls
    expect(screen.getByText('45,000')).toBeInTheDocument(); // inputTokens formatted

    // Breakdown categories (labels are localized; raw codes fall back verbatim).
    expect(screen.getByText('一般問答')).toBeInTheDocument(); // GENERAL_CHAT
    expect(screen.getByText('規則引擎')).toBeInTheDocument(); // PROGRAM_RULE

    // Top users table.
    expect(screen.getByText('使用者排行（前 10）')).toBeInTheDocument();
    expect(screen.getByText('Premium User')).toBeInTheDocument();
  });

  it('surfaces a permission notice on 403', async () => {
    setAuthRole('ADMIN');
    // Default handler already 403s; assert the list-style permission notice.
    renderWithProviders(<AdminAiUsagePage />);
    await waitFor(() =>
      expect(screen.getByText('你的帳號目前無法使用此功能。')).toBeInTheDocument(),
    );
  });
});
