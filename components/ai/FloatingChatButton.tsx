'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/use-auth';
import { useChatStore } from '@/features/ai/chat-store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GeneralFloatingChat } from '@/components/ai/GeneralFloatingChat';

// Visible only to USER/PREMIUM (hidden for ADMIN and guests). The chat thread and
// in-flight request live in a module-level store (see chat-store), so an ongoing
// answer is never interrupted by closing this window or navigating the site.
export function FloatingChatButton() {
  const { isAppUser } = useAuth();
  const [open, setOpen] = useState(false);
  // Reflect an in-flight request even while the window is closed, so it's clear
  // the answer is still being generated in the background (not interrupted).
  const isPending = useChatStore((s) => s.isPending);

  if (!isAppUser) return null;

  return (
    <>
      <button
        type="button"
        aria-label={isPending ? 'AI 回答產生中，點擊查看' : '開啟 AI 問答'}
        data-testid="floating-chat-button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-transform hover:scale-105"
      >
        💬
        {isPending && (
          <span
            data-testid="chat-pending-indicator"
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-amber-500" />
          </span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="AI 問答"
        footer={
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            關閉
          </Button>
        }
      >
        <GeneralFloatingChat />
      </Modal>
    </>
  );
}
