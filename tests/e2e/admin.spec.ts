import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('ADMIN', () => {
  test('logs in and lands on /admin/accounts', async ({ page }) => {
    await loginAs(page, 'admin');
    await expect(page.getByRole('heading', { name: '帳號管理' })).toBeVisible();
  });

  test('can list users', async ({ page }) => {
    await loginAs(page, 'admin');
    await expect(page.getByText('user@example.com')).toBeVisible();
    await expect(page.getByText('premium@example.com')).toBeVisible();
  });

  test('does not see normal nav or floating chat', async ({ page }) => {
    await loginAs(page, 'admin');
    await expect(page.getByRole('navigation', { name: '主導覽' })).toHaveCount(0);
    await expect(page.getByTestId('floating-chat-button')).toHaveCount(0);
  });

  test('cannot access /matches', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/matches');
    await expect(page).toHaveURL(/\/admin\/accounts/);
  });
});
