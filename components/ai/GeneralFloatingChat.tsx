'use client';

import { useState } from 'react';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api-client';
import { CHAT_EXAMPLES, CHAT_QUESTION_MAX, COPY } from '@/lib/constants';
import { useChatStore } from '@/features/ai/chat-store';

function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isForbidden) return COPY.forbidden;
    if (error.code === 'NETWORK_ERROR') return COPY.genericError;
    return error.message || COPY.chatError;
  }
  return COPY.chatError;
}

// View only. The thread (turns + in-flight request) lives in a module-level store,
// so it survives this component unmounting — whether the modal closes, the user
// navigates away, or FloatingChatButton briefly unmounts during an auth re-check.
export function GeneralFloatingChat() {
  const [input, setInput] = useState('');
  const turns = useChatStore((s) => s.turns);
  const isPending = useChatStore((s) => s.isPending);
  const isError = useChatStore((s) => s.isError);
  const error = useChatStore((s) => s.error);
  const send = useChatStore((s) => s.send);

  const trimmed = input.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= CHAT_QUESTION_MAX && !isPending;

  function submit(question: string) {
    const q = question.trim();
    if (q.length === 0 || q.length > CHAT_QUESTION_MAX || isPending) return;
    // Clear immediately: the request lives in the store, so the input box is safe
    // to reset even if the user closes the modal before the reply lands.
    send(q);
    setInput('');
  }

  return (
    <div className="flex flex-col gap-3" data-testid="general-chat">
      {/* Conversation thread (latest 3) */}
      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
        {turns.length === 0 && !isPending ? (
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

        {isPending && (
          <p className="self-start text-sm text-slate-400" role="status">
            AI 回答產生中…
          </p>
        )}
      </div>

      {isError && <p className="text-sm text-red-600">{chatErrorMessage(error)}</p>}

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
        <Button type="submit" size="sm" isLoading={isPending} disabled={!canSend}>
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
