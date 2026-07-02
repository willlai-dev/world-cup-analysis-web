import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

// Verifies the user's requirement: closing the floating chat while a request is
// in flight must NOT interrupt it. The answer should land in the background and
// be visible on reopen — even after navigating to another page.
test.describe('floating chat runs in background', () => {
  // Delay the browser→Next call so we have a window to close the modal while pending.
  async function delayChat(page: import('@playwright/test').Page, ms = 3000) {
    await page.route('**/api/ai/chat', async (route) => {
      await new Promise((r) => setTimeout(r, ms));
      await route.fulfill({
        status: 201,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          data: {
            answer: `背景回答：${JSON.parse(route.request().postData() ?? '{}').question ?? ''}`,
            provider: 'NVIDIA',
            model: 'mock-model',
            sourceUpdatedAt: null,
          },
          meta: {},
          error: null,
        }),
      });
    });
  }

  test('answer survives closing the modal mid-request', async ({ page }) => {
    await loginAs(page, 'user');
    await delayChat(page, 6000); // closer to a real, slow AI call

    await page.getByTestId('floating-chat-button').click();
    await page.getByLabel('輸入問題').fill('冠軍預測誰最有機會？');
    await page.getByRole('button', { name: '送出' }).click();

    // Close the window IMMEDIATELY, racing the pending state.
    await page.getByRole('button', { name: '關閉' }).click();
    await expect(page.getByTestId('general-chat')).toHaveCount(0);

    // While closed, the floating button shows a "still working" indicator.
    await expect(page.getByTestId('chat-pending-indicator')).toBeVisible();

    // Reopen while still in flight: the request is tracked, spinner shows...
    await page.getByTestId('floating-chat-button').click();
    await expect(page.getByRole('status')).toHaveText('AI 回答產生中…');

    // ...and the answer lands.
    await expect(page.getByText('背景回答：冠軍預測誰最有機會？')).toBeVisible({ timeout: 15_000 });
  });

  test('answer survives closing AND navigating to another page', async ({ page }) => {
    await loginAs(page, 'user');
    await delayChat(page);

    await page.getByTestId('floating-chat-button').click();
    await page.getByLabel('輸入問題').fill('法國陣容如何？');
    await page.getByRole('button', { name: '送出' }).click();
    await expect(page.getByRole('status')).toHaveText('AI 回答產生中…');

    // Close and navigate elsewhere (client-side, as a real user does) while the
    // request is still running.
    await page.getByRole('button', { name: '關閉' }).click();
    await page.getByRole('navigation', { name: '主導覽' }).getByRole('link', { name: '國家隊' }).click();
    await expect(page.getByRole('heading', { name: '國家隊' })).toBeVisible();

    // Reopen the chat on the new page — the thread and answer are still there.
    await page.getByTestId('floating-chat-button').click();
    await expect(page.getByText('背景回答：法國陣容如何？')).toBeVisible({ timeout: 10_000 });
  });
});
