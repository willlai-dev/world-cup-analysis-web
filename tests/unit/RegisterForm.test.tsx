import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { renderWithProviders } from '@/tests/utils';

describe('RegisterForm password confirmation', () => {
  it('errors when passwords do not match', async () => {
    renderWithProviders(<RegisterForm />);
    await userEvent.type(screen.getByLabelText('電子郵件'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('顯示名稱'), 'New User');
    await userEvent.type(screen.getByLabelText('密碼'), 'password1');
    await userEvent.type(screen.getByLabelText('確認密碼'), 'password2');
    await userEvent.click(screen.getByRole('button', { name: '註冊' }));
    expect(await screen.findByText('兩次輸入的密碼不一致')).toBeInTheDocument();
  });

  it('enforces minimum password length', async () => {
    renderWithProviders(<RegisterForm />);
    await userEvent.type(screen.getByLabelText('密碼'), '123');
    await userEvent.click(screen.getByRole('button', { name: '註冊' }));
    expect(await screen.findByText('密碼至少 8 個字元')).toBeInTheDocument();
  });
});
