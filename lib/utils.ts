// Minimal className combiner (no external clsx/tailwind-merge dependency).
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

// "user@example.com" -> "u***@example.com" — shown on the verify-email page.
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return `${email[0]}***${email.slice(at)}`;
}
