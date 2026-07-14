'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { resendVerification, verifyEmail } from '@/features/auth/auth-api';
import { ApiError } from '@/lib/api-client';
import { routes } from '@/lib/routes';
import { maskEmail } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const RESEND_COOLDOWN_SECONDS = 60;

function retryAfterSeconds(error: unknown): number {
  if (error instanceof ApiError && typeof error.details === 'object' && error.details !== null) {
    const value = (error.details as { retryAfterSeconds?: unknown }).retryAfterSeconds;
    if (typeof value === 'number' && value > 0) return Math.ceil(value);
  }
  return RESEND_COOLDOWN_SECONDS;
}

/** Countdown-gated「重新寄送驗證信」block, shared by every panel state. */
function ResendSection({ initialEmail }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const mutation = useMutation({
    mutationFn: (value: string) => resendVerification(value),
    onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'EMAIL_SEND_COOLDOWN') {
        setCooldown(retryAfterSeconds(error));
      }
    },
  });

  const alreadyVerified =
    mutation.error instanceof ApiError && mutation.error.code === 'EMAIL_ALREADY_VERIFIED';

  return (
    <div className="flex flex-col gap-3">
      {initialEmail ? (
        <p className="text-sm text-slate-600">
          驗證信寄送對象：<span className="font-medium text-slate-900">{maskEmail(initialEmail)}</span>
        </p>
      ) : (
        <Input
          label="電子郵件"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="輸入註冊時使用的電子郵件"
        />
      )}

      {mutation.isSuccess && cooldown > 0 && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          驗證信已重新寄出，請到信箱查收（連結 15 分鐘內有效）。
        </p>
      )}
      {mutation.error instanceof ApiError && !alreadyVerified && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error.message}
        </p>
      )}
      {alreadyVerified && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          此 Email 已完成驗證，
          <Link href={routes.login} className="font-medium underline">
            前往登入
          </Link>
          。
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        isLoading={mutation.isPending}
        disabled={cooldown > 0 || !email || alreadyVerified}
        onClick={() => mutation.mutate(email)}
      >
        {cooldown > 0 ? `重新寄送驗證信（${cooldown} 秒後可再寄）` : '重新寄送驗證信'}
      </Button>
    </div>
  );
}

export function VerifyEmailPanel({ token, email }: { token?: string; email?: string }) {
  const router = useRouter();
  const startedRef = useRef(false);

  const verifyMutation = useMutation({
    mutationFn: (value: string) => verifyEmail(value),
  });
  const { mutate: runVerify } = verifyMutation;

  // A token in the URL means the user clicked the mail link — verify immediately.
  useEffect(() => {
    if (token && !startedRef.current) {
      startedRef.current = true;
      runVerify(token);
    }
  }, [token, runVerify]);

  // Verified → bounce to the login page (re-login is required by design).
  useEffect(() => {
    if (!verifyMutation.isSuccess) return;
    const timer = setTimeout(() => router.replace(`${routes.login}?verified=1`), 2500);
    return () => clearTimeout(timer);
  }, [verifyMutation.isSuccess, router]);

  if (token) {
    if (verifyMutation.isSuccess) {
      return (
        <div className="flex flex-col gap-3">
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            ✅ Email 驗證成功！即將前往登入頁，請重新登入。
          </p>
          <Link href={`${routes.login}?verified=1`} className="text-sm font-medium text-brand-700 hover:underline">
            立即前往登入
          </Link>
        </div>
      );
    }
    if (verifyMutation.isError) {
      const err = verifyMutation.error;
      const message =
        err instanceof ApiError ? err.message : '驗證失敗，請稍後再試。';
      return (
        <div className="flex flex-col gap-4">
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
          <ResendSection initialEmail={email} />
        </div>
      );
    }
    return <p className="text-sm text-slate-600">驗證中，請稍候…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        我們已寄出一封驗證信，請開啟信中的連結完成驗證（連結 15 分鐘內有效，僅可使用一次）。
        完成驗證後即可登入。
      </p>
      <ResendSection initialEmail={email} />
    </div>
  );
}
