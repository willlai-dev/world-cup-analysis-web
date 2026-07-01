'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/use-auth';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GeneralFloatingChat, type ChatTurn } from '@/components/ai/GeneralFloatingChat';

// Visible only to USER/PREMIUM (hidden for ADMIN and guests). Owns the chat thread
// state so it survives the modal open/close cycle.
export function FloatingChatButton() {
  const { isAppUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);

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
        <GeneralFloatingChat turns={turns} onTurnsChange={setTurns} />
      </Modal>
    </>
  );
}
