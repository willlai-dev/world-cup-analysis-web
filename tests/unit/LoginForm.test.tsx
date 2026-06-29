import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/LoginForm';
import { renderWithProviders } from '@/tests/utils';

describe('LoginForm validation', () => {
  it('shows validation errors for empty submit', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: '登入' }));
    expect(await screen.findByText('請輸入電子郵件')).toBeInTheDocument();
    expect(screen.getByText('請輸入密碼')).toBeInTheDocument();
  });

  it('rejects an invalid email format', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText('電子郵件'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('密碼'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: '登入' }));
    expect(await screen.findByText('電子郵件格式不正確')).toBeInTheDocument();
  });
});
