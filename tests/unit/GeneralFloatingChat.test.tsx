import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, delay } from 'msw';
import { GeneralFloatingChat } from '@/components/ai/GeneralFloatingChat';
import { server } from '@/tests/mocks/server';
import { ok, fail, API } from '@/tests/mocks/handlers';
import { CHAT_EXAMPLES, COPY } from '@/lib/constants';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

// The thread lives in a module-level store, so the view takes no props.
function Harness() {
  return <GeneralFloatingChat />;
}

// Fully unmounts/remounts the chat view (as closing the modal or navigating does),
// while the store persists — so we can assert an in-flight answer survives.
function ModalHarness() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        toggle
      </button>
      {open && <GeneralFloatingChat />}
    </>
  );
}

describe('GeneralFloatingChat', () => {
  it('renders the example prompts and empty-state copy', () => {
    setAuthRole('USER');
    renderWithProviders(<Harness />);
    expect(screen.getByText(COPY.chatEmpty)).toBeInTheDocument();
    for (const example of CHAT_EXAMPLES) {
      expect(screen.getByRole('button', { name: example })).toBeInTheDocument();
    }
  });

  it('sends a question and shows the answer with a provider badge', async () => {
    setAuthRole('USER');
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.type(screen.getByLabelText('輸入問題'), '法國有哪些高評級球員？');
    await user.click(screen.getByRole('button', { name: '送出' }));

    await waitFor(() =>
      expect(screen.getByText('模擬回答：法國有哪些高評級球員？')).toBeInTheDocument(),
    );
    expect(screen.getByText(/NVIDIA/)).toBeInTheDocument();
  });

  it('replays prior turns as history on the next question', async () => {
    setAuthRole('USER');
    const bodies: Array<{ question?: string; history?: Array<{ role: string; content: string }> }> =
      [];
    server.use(
      http.post(`${API}/ai/chat`, async ({ request }) => {
        const body = (await request.json()) as (typeof bodies)[number];
        bodies.push(body);
        return ok({
          answer: `模擬回答：${body.question ?? ''}`,
          provider: 'NVIDIA',
          model: null,
          sourceUpdatedAt: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    const input = screen.getByLabelText('輸入問題');
    await user.type(input, 'Mbappé 是誰？');
    await user.click(screen.getByRole('button', { name: '送出' }));
    await waitFor(() => expect(screen.getByText('模擬回答：Mbappé 是誰？')).toBeInTheDocument());

    await user.type(input, '他最近狀態如何？');
    await user.click(screen.getByRole('button', { name: '送出' }));
    await waitFor(() => expect(screen.getByText('模擬回答：他最近狀態如何？')).toBeInTheDocument());

    // First request is single-turn (no history); second replays the first Q&A.
    expect(bodies[0].history).toBeUndefined();
    expect(bodies[1].question).toBe('他最近狀態如何？');
    expect(bodies[1].history).toEqual([
      { role: 'user', content: 'Mbappé 是誰？' },
      { role: 'assistant', content: '模擬回答：Mbappé 是誰？' },
    ]);
  });

  it('keeps the in-flight answer when the modal is closed mid-request', async () => {
    setAuthRole('USER');
    server.use(
      http.post(`${API}/ai/chat`, async ({ request }) => {
        const body = (await request.json()) as { question?: string };
        await delay(50); // still pending when we close the modal
        return ok({
          answer: `模擬回答：${body.question ?? ''}`,
          provider: 'NVIDIA',
          model: null,
          sourceUpdatedAt: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ModalHarness />);

    await user.type(screen.getByLabelText('輸入問題'), '冠軍預測誰最有機會？');
    await user.click(screen.getByRole('button', { name: '送出' }));

    // Close the modal before the answer arrives.
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.queryByTestId('general-chat')).not.toBeInTheDocument();

    // Reopen; the answer landed while closed and is shown.
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() =>
      expect(screen.getByText('模擬回答：冠軍預測誰最有機會？')).toBeInTheDocument(),
    );
  });

  it('shows an error message when the request is forbidden', async () => {
    setAuthRole('USER');
    server.use(http.post(`${API}/ai/chat`, () => fail(403, 'FORBIDDEN', '權限不足')));
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.type(screen.getByLabelText('輸入問題'), '測試問題');
    await user.click(screen.getByRole('button', { name: '送出' }));

    await waitFor(() => expect(screen.getByText(COPY.forbidden)).toBeInTheDocument());
  });

  it('fills the input when an example prompt is clicked', async () => {
    setAuthRole('USER');
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: CHAT_EXAMPLES[0] }));
    expect(screen.getByLabelText('輸入問題')).toHaveValue(CHAT_EXAMPLES[0]);
  });
});
