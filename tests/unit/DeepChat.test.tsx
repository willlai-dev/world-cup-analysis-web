import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { DeepChat } from '@/components/ai/DeepChat';
import { server } from '@/tests/mocks/server';
import { API } from '@/tests/mocks/handlers';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

const ENDPOINT = '/players/p1/deep-chat';

describe('DeepChat', () => {
  it('lets PREMIUM ask and shows the grounded answer', async () => {
    setAuthRole('PREMIUM');
    const user = userEvent.setup();
    renderWithProviders(<DeepChat endpoint={ENDPOINT} context="Kylian Mbappe" />);

    expect(screen.getByTestId('deep-chat-panel')).toBeInTheDocument();
    await user.type(screen.getByLabelText('輸入深層問題'), '他這場的角色是什麼？');
    await user.click(screen.getByRole('button', { name: '送出' }));

    await waitFor(() => expect(screen.getByText('模擬深層回答（球員）')).toBeInTheDocument());
  });

  it('shows a premium-locked notice for USER (no panel)', () => {
    setAuthRole('USER');
    renderWithProviders(<DeepChat endpoint={ENDPOINT} context="Kylian Mbappe" />);

    expect(screen.queryByTestId('deep-chat-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('premium-locked')).toBeInTheDocument();
  });

  it('renders the quota notice on a 429 AI_QUOTA_EXCEEDED', async () => {
    setAuthRole('PREMIUM');
    server.use(
      http.post(`${API}/players/:id/deep-chat`, () =>
        HttpResponse.json(
          {
            data: null,
            error: {
              code: 'AI_QUOTA_EXCEEDED',
              message: '今日深層問答額度已用完。',
              details: {
                quotaKey: 'DEEP_CHAT',
                limit: 50,
                used: 50,
                resetAt: '2026-07-03T00:00:00.000Z',
              },
            },
          },
          { status: 429 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DeepChat endpoint={ENDPOINT} context="Kylian Mbappe" />);

    await user.type(screen.getByLabelText('輸入深層問題'), '再問一題');
    await user.click(screen.getByRole('button', { name: '送出' }));

    await waitFor(() => expect(screen.getByTestId('ai-quota-notice')).toBeInTheDocument());
    expect(screen.getByText('今日深層問答額度已用完。')).toBeInTheDocument();
    expect(screen.getByText(/已使用 50\/50/)).toBeInTheDocument();
  });
});
