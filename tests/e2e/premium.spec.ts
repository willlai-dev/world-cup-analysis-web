import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('PREMIUM', () => {
  test('logs in and lands on /matches', async ({ page }) => {
    await loginAs(page, 'premium');
    await expect(page.getByRole('heading', { name: '賽事' })).toBeVisible();
  });

  test('sees the news translation panel', async ({ page }) => {
    await loginAs(page, 'premium');
    await page.goto('/news/news-1');
    await expect(page.getByTestId('translation-panel')).toBeVisible();
  });

  test('sees deep chat panels on detail pages', async ({ page }) => {
    await loginAs(page, 'premium');
    await page.goto('/teams/team-fra');
    await expect(page.getByTestId('deep-chat-panel')).toBeVisible();
  });

  test('sees the champion recalculate button', async ({ page }) => {
    await loginAs(page, 'premium');
    await page.goto('/champion-predictions');
    await expect(page.getByRole('button', { name: '重新跑預測' })).toBeVisible();
  });
});
