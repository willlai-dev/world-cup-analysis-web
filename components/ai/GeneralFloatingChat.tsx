'use client';

import { useState } from 'react';
import { useGeneralChat } from '@/features/ai/use-chat';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api-client';
import { CHAT_EXAMPLES, CHAT_QUESTION_MAX, COPY } from '@/lib/constants';
import type { ChatAnswer } from '@/types/api';

export type ChatTurn = { id: string; question: string; answer: ChatAnswer };

// Keep only the most recent N turns (backend is single-turn/stateless; the thread
// is a client-only convenience). Confirmed UX: show the latest 3.
export const MAX_CHAT_TURNS = 3;

function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isForbidden) return COPY.forbidden;
    if (error.code === 'NETWORK_ERROR') return COPY.genericError;
    return error.message || COPY.chatError;
  }
  return COPY.chatError;
}

export function GeneralFloatingChat({
  turns,
  onTurnsChange,
}: {
  turns: ChatTurn[];
  onTurnsChange: (next: ChatTurn[]) => void;
}) {
  const [input, setInput] = useState('');
  const chat = useGeneralChat();

  const trimmed = input.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= CHAT_QUESTION_MAX && !chat.isPending;

  function submit(question: string) {
    const q = question.trim();
    if (q.length === 0 || q.length > CHAT_QUESTION_MAX || chat.isPending) return;
    chat.mutate(q, {
      onSuccess: (answer) => {
        const turn: ChatTurn = { id: `${Date.now()}`, question: q, answer };
        onTurnsChange([...turns, turn].slice(-MAX_CHAT_TURNS));
        setInput('');
      },
    });
  }

  return (
    <div className="flex flex-col gap-3" data-testid="general-chat">
      {/* Conversation thread (latest 3) */}
      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
        {turns.length === 0 && !chat.isPending ? (
          <p className="py-6 text-center text-sm text-slate-400">{COPY.chatEmpty}</p>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="flex flex-col gap-2" data-testid="chat-turn">
              <p className="self-end rounded-lg rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">
                {turn.question}
              </p>
              <div className="self-start rounded-lg rounded-bl-sm bg-slate-100 px-3 py-2">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {turn.answer.answer}
                </p>
                <AiSourceMeta
                  className="mt-2"
                  provider={turn.answer.provider}
                  model={turn.answer.model}
                  sourceUpdatedAt={turn.answer.sourceUpdatedAt}
                />
              </div>
            </div>
          ))
        )}

        {chat.isPending && (
          <p className="self-start text-sm text-slate-400" role="status">
            AI 回答產生中…
          </p>
        )}
      </div>

      {chat.isError && <p className="text-sm text-red-600">{chatErrorMessage(chat.error)}</p>}

      {/* Composer */}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          rows={2}
          maxLength={CHAT_QUESTION_MAX}
          placeholder={COPY.chatPlaceholder}
          aria-label="輸入問題"
          className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button type="submit" size="sm" isLoading={chat.isPending} disabled={!canSend}>
          送出
        </Button>
      </form>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        {CHAT_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
