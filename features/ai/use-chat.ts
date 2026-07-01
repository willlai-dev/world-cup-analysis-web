'use client';

import { useMutation } from '@tanstack/react-query';
import { sendGeneralChat } from '@/features/ai/ai-api';

export function useGeneralChat() {
  return useMutation({
    mutationFn: (question: string) => sendGeneralChat(question),
  });
}
