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

  test('shows elimination status on the teams list', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/teams');
    // The mock backend marks Argentina as eliminated.
    await expect(page.getByText('已淘汰').first()).toBeVisible();
  });

  test('can ask the floating chat and get an answer', async ({ page }) => {
    await loginAs(page, 'user');
    await page.getByTestId('floating-chat-button').click();
    await page.getByLabel('輸入問題').fill('法國有哪些高評級球員？');
    await page.getByRole('button', { name: '送出' }).click();
    await expect(page.getByText('模擬回答：法國有哪些高評級球員？')).toBeVisible();
  });

  test('sees the general floating chat but premium features show a can-not-use notice', async ({ page }) => {
    await loginAs(page, 'user');
    await expect(page.getByTestId('floating-chat-button')).toBeVisible();

    await page.goto('/news/news-1');
    await expect(page.getByText('AI 摘要')).toBeVisible();
    // The PREMIUM panels themselves are not rendered for USER...
    await expect(page.getByTestId('translation-panel')).toHaveCount(0);
    await expect(page.getByTestId('deep-chat-panel')).toHaveCount(0);
    // ...instead USER sees a plain "can't use" notice in their place.
    await expect(page.getByTestId('premium-locked').first()).toBeVisible();
    await expect(page.getByText('你的帳號目前無法使用此功能。').first()).toBeVisible();
  });

  test('cannot access admin pages', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/admin/accounts');
    await expect(page).toHaveURL(/\/matches/);
  });
});
