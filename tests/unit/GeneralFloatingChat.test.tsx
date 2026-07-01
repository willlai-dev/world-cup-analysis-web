import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { GeneralFloatingChat, type ChatTurn } from '@/components/ai/GeneralFloatingChat';
import { server } from '@/tests/mocks/server';
import { fail, API } from '@/tests/mocks/handlers';
import { CHAT_EXAMPLES, COPY } from '@/lib/constants';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

// Stateful harness so onTurnsChange actually advances the thread.
function Harness() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  return <GeneralFloatingChat turns={turns} onTurnsChange={setTurns} />;
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
