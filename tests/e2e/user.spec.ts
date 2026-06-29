import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('USER', () => {
  test('logs in and lands on /matches', async ({ page }) => {
    await loginAs(page, 'user');
    await expect(page.getByRole('heading', { name: '賽事' })).toBeVisible();
  });

  test('can open teams and players', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/teams');
    await expect(page.getByRole('heading', { name: '國家隊' })).toBeVisible();
    await page.goto('/players');
    await expect(page.getByRole('heading', { name: '球員' })).toBeVisible();
  });

  test('sees the general floating chat but no premium-only controls', async ({ page }) => {
    await loginAs(page, 'user');
    await expect(page.getByTestId('floating-chat-button')).toBeVisible();

    await page.goto('/news/news-1');
    await expect(page.getByText('AI 摘要')).toBeVisible();
    await expect(page.getByTestId('translation-panel')).toHaveCount(0);
    await expect(page.getByTestId('deep-chat-panel')).toHaveCount(0);
  });

  test('cannot access admin pages', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/admin/accounts');
    await expect(page).toHaveURL(/\/matches/);
  });
});
