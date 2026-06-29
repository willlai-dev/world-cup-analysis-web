'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/use-auth';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// Phase 1 stub: visible only to USER/PREMIUM (hidden for ADMIN and guests).
// The actual `POST /ai/chat` wiring lands in Phase 2; here it only proves visibility rules.
export function FloatingChatButton() {
  const { isAppUser } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAppUser) return null;

  return (
    <>
      <button
        type="button"
        aria-label="開啟 AI 問答"
        data-testid="floating-chat-button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-transform hover:scale-105"
      >
        💬
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="AI 問答">
        <p className="text-sm text-slate-600">
          一般 AI 問答將於 Phase 2 開放。屆時可詢問賽事、國家隊、球員、新聞與冠軍預測。
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            關閉
          </Button>
        </div>
      </Modal>
    </>
  );
}
