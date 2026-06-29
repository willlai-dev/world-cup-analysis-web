import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { FloatingChatButton } from '@/components/ai/FloatingChatButton';
import { renderWithProviders, setAuthRole } from '@/tests/utils';

describe('FloatingChatButton visibility', () => {
  it('is hidden for ADMIN', () => {
    setAuthRole('ADMIN');
    renderWithProviders(<FloatingChatButton />);
    expect(screen.queryByTestId('floating-chat-button')).not.toBeInTheDocument();
  });

  it('is hidden for guests', () => {
    setAuthRole('GUEST');
    renderWithProviders(<FloatingChatButton />);
    expect(screen.queryByTestId('floating-chat-button')).not.toBeInTheDocument();
  });

  it('is visible for USER and PREMIUM', () => {
    setAuthRole('USER');
    const { rerender } = renderWithProviders(<FloatingChatButton />);
    expect(screen.getByTestId('floating-chat-button')).toBeInTheDocument();

    setAuthRole('PREMIUM');
    rerender(<FloatingChatButton />);
    expect(screen.getByTestId('floating-chat-button')).toBeInTheDocument();
  });
});
