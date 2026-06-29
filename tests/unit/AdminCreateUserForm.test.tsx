import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCreateUserForm } from '@/components/forms/AdminCreateUserForm';
import { renderWithProviders } from '@/tests/utils';

describe('AdminCreateUserForm role select', () => {
  it('offers USER / PREMIUM / ADMIN roles and submits the chosen one', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AdminCreateUserForm onSubmit={onSubmit} />);

    const roleSelect = screen.getByLabelText('角色') as HTMLSelectElement;
    expect(Array.from(roleSelect.options).map((o) => o.value)).toEqual([
      'USER',
      'PREMIUM',
      'ADMIN',
    ]);

    await userEvent.type(screen.getByLabelText('電子郵件'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('顯示名稱'), 'New Premium');
    await userEvent.type(screen.getByLabelText('密碼'), 'password123');
    await userEvent.selectOptions(roleSelect, 'PREMIUM');
    await userEvent.click(screen.getByRole('button', { name: '建立帳號' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ role: 'PREMIUM' });
  });

  it('hides the role select when role is locked', () => {
    renderWithProviders(<AdminCreateUserForm onSubmit={vi.fn()} lockRole="ADMIN" />);
    expect(screen.queryByLabelText('角色')).not.toBeInTheDocument();
  });
});
