import { type Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  await page.getByLabel('電子郵件').fill(email);
  // exact: the hold-to-reveal button's aria-label ("按住以顯示密碼") also
  // contains 密碼 and would otherwise trip strict mode.
  await page.getByLabel('密碼', { exact: true }).fill(password);
  // Scope to the form to avoid matching the header "登入" link.
  await page.locator('form').getByRole('button', { name: '登入' }).click();
}

export async function loginAs(page: Page, role: 'user' | 'premium' | 'admin') {
  await login(page, `${role}@example.com`);
  if (role === 'admin') {
    await expect(page).toHaveURL(/\/admin\/accounts/);
  } else {
    await expect(page).toHaveURL(/\/matches/);
  }
}
