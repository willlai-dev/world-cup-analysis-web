// Hands the "which email needs verification" hint from login/register to the
// /verify-email page via sessionStorage instead of a query param, so the email
// never lands in browser history, logs, analytics, or Referer headers.
// sessionStorage is tab-scoped and cleared when the tab closes.

const KEY = 'pending-verification-email';

export function stashPendingVerificationEmail(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Storage unavailable (private mode/quota) — the page falls back to manual entry.
  }
}

export function readPendingVerificationEmail(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingVerificationEmail(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
