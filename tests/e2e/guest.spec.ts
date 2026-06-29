import { test, expect } from '@playwright/test';

test.describe('Guest', () => {
  test('can view the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'AI World Cup Analyst' })).toBeVisible();
    // Both header and hero expose a login link for guests.
    await expect(page.getByRole('link', { name: '登入' }).first()).toBeVisible();
  });

  test('is redirected to /login when visiting a protected route', async ({ page }) => {
    await page.goto('/matches');
    await expect(page).toHaveURL(/\/login/);
  });

  test('does not see the floating chat button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('floating-chat-button')).toHaveCount(0);
  });
});
