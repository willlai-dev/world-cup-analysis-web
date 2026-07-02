import { create } from 'zustand';
import { sendGeneralChat } from '@/features/ai/ai-api';
import { CHAT_QUESTION_MAX } from '@/lib/constants';
import type { ChatAnswer, ChatMessage } from '@/types/api';

export type ChatTurn = { id: string; question: string; answer: ChatAnswer };

// Keep only the most recent N turns. The backend is stateless and only uses the
// last 6 messages (3 Q&A pairs), so retaining 3 turns feeds it a full window.
// Confirmed UX: show the latest 3.
export const MAX_CHAT_TURNS = 3;

// Flatten UI turns into the old→new {role,content} history the backend expects.
// Excludes the current question (that goes in `question`, not `history`).
function toHistory(turns: ChatTurn[]): ChatMessage[] {
  return turns.flatMap((turn) => [
    { role: 'user' as const, content: turn.question },
    { role: 'assistant' as const, content: turn.answer.answer },
  ]);
}

type ChatState = {
  turns: ChatTurn[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  send: (question: string) => void;
  reset: () => void;
};

// Module-level store, NOT component state. The chat thread and the in-flight
// request must survive the user closing the floating window, navigating to
// another page, or a brief auth re-check that unmounts FloatingChatButton. Since
// send() fires the request as a plain promise and writes the result back through
// the store's set() (not a component setState), the answer lands even when no
// chat component is mounted, and shows up whenever one re-subscribes. It only
// resets on full page reload (fine — the backend is stateless anyway).
export const useChatStore = create<ChatState>((set, get) => ({
  turns: [],
  isPending: false,
  isError: false,
  error: null,

  send: (question) => {
    const q = question.trim();
    // One request at a time; mirrors the disabled composer while pending.
    if (q.length === 0 || q.length > CHAT_QUESTION_MAX || get().isPending) return;

    const history = toHistory(get().turns);
    set({ isPending: true, isError: false, error: null });

    sendGeneralChat(q, history)
      .then((answer) => {
        set((state) => ({
          turns: [...state.turns, { id: `${Date.now()}`, question: q, answer }].slice(
            -MAX_CHAT_TURNS,
          ),
          isPending: false,
        }));
      })
      .catch((error) => {
        set({ error, isError: true, isPending: false });
      });
  },

  reset: () => set({ turns: [], isPending: false, isError: false, error: null }),
}));
