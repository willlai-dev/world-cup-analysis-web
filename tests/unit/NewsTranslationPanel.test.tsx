import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsTranslationPanel } from '@/components/ai/NewsTranslationPanel';
import { newsFixtures } from '@/tests/mocks/fixtures';
import { renderWithProviders, setAuthRole } from '@/tests/utils';
import type { NewsDetail } from '@/types/api';

const newsDetail: NewsDetail = {
  ...newsFixtures[0],
  translationStatus: 'NONE',
  contentSnippet: 'snippet',
  translatedContentZh: null,
  language: 'en',
  fetchedAt: '2026-06-01T09:00:00.000Z',
};

describe('NewsTranslationPanel', () => {
  it('translates on click and shows the translated content for PREMIUM', async () => {
    setAuthRole('PREMIUM');
    const user = userEvent.setup();
    renderWithProviders(<NewsTranslationPanel news={newsDetail} />);

    expect(screen.getByTestId('translation-panel')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '翻譯' }));

    await waitFor(() =>
      expect(screen.getByTestId('translated-content')).toHaveTextContent(
        '這是翻譯後的繁體中文內容。',
      ),
    );
  });

  it('shows a premium-locked notice for USER (no translate panel)', () => {
    setAuthRole('USER');
    renderWithProviders(<NewsTranslationPanel news={newsDetail} />);

    expect(screen.queryByTestId('translation-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('premium-locked')).toBeInTheDocument();
  });
});
