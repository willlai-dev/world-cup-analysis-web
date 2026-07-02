'use client';

import { useState } from 'react';
import { PremiumGate } from '@/components/auth/RoleGate';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AiSourceMeta } from '@/components/ai/AiSourceMeta';
import { AiQuotaNotice } from '@/components/ai/AiQuotaNotice';
import { sendDeepChat } from '@/features/ai/deep-chat-api';
import { aiErrorMessage, isQuotaError } from '@/lib/ai';
import { CHAT_QUESTION_MAX, COPY } from '@/lib/constants';
import type { ChatAnswer } from '@/types/api';

type DeepTurn = { id: string; question: string; answer: ChatAnswer };

// Keep the last few Q&A locally. Deep chat is stateless per request (no history
// sent), so this is display-only context for the reader.
const DEEP_CHAT_MAX_TURNS = 5;

// PREMIUM-only deep-chat panel for an entity (match / team / player / news /
// champion). `endpoint` is the /api-relative deep-chat path. USER sees a plain
// "can't use" notice via PremiumGate; ADMIN never reaches these pages.
export function DeepChat({ endpoint, context }: { endpoint: string; context: string }) {
  const [turns, setTurns] = useState<DeepTurn[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const trimmed = input.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= CHAT_QUESTION_MAX && !isPending;

  async function submit(question: string) {
    const q = question.trim();
    if (q.length === 0 || q.length > CHAT_QUESTION_MAX || isPending) return;
    setInput('');
    setIsPending(true);
    setError(null);
    try {
      const answer = await sendDeepChat(endpoint, q);
      setTurns((prev) =>
        [...prev, { id: `${Date.now()}`, question: q, answer }].slice(-DEEP_CHAT_MAX_TURNS),
      );
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <PremiumGate feature="深層 AI 問答">
      <Card data-testid="deep-chat-panel">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>深層 AI 問答</CardTitle>
          <Badge tone="premium">PREMIUM</Badge>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">針對「{context}」向 AI 提問，回答會參考此頁資料。</p>

          {turns.length > 0 && (
            <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
              {turns.map((turn) => (
                <div key={turn.id} className="flex flex-col gap-2" data-testid="deep-chat-turn">
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
              ))}
            </div>
          )}

          {isPending && (
            <p className="self-start text-sm text-slate-400" role="status">
              AI 回答產生中…
            </p>
          )}

          {error != null &&
            (isQuotaError(error) ? (
              <AiQuotaNotice error={error} />
            ) : (
              <p className="text-sm text-red-600">{aiErrorMessage(error, COPY.chatError)}</p>
            ))}

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
              aria-label="輸入深層問題"
              className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button type="submit" size="sm" isLoading={isPending} disabled={!canSend}>
              送出
            </Button>
          </form>
        </CardBody>
      </Card>
    </PremiumGate>
  );
}
