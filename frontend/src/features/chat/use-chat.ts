import {
  addTransitionType,
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { streamReply } from "@/features/chat/generate-reply";
import {
  countExpired,
  nextExpiry,
  removeExpired,
} from "@/features/chat/message-retention";
import type { ChatMessage } from "@/features/chat/types";

/** Transition type for deletions; only message rows animate for it. */
export const MESSAGE_EXPIRE_TRANSITION = "message-expire";

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

/**
 * The AI chat, in memory only: never written to storage, cookies or the
 * console. Messages older than `ttlMs` are deleted.
 */
export function useChat(ttlMs: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const replyController = useRef<AbortController | null>(null);

  // Cancel a reply in progress if the chat unmounts (e.g. the 404 page).
  useEffect(() => {
    return () => replyController.current?.abort();
  }, []);

  /** Returns false if none had expired yet. */
  const pruneExpired = useEffectEvent((): boolean => {
    const now = Date.now();
    if (countExpired(messages, now, ttlMs) === 0) return false;
    startTransition(() => {
      addTransitionType(MESSAGE_EXPIRE_TRANSITION);
      setMessages((prev) => removeExpired(prev, now, ttlMs));
    });
    return true;
  });

  // Compares the clock with createdAt instead of counting down, so throttled
  // background tabs and sleep don't delay deletion.
  useEffect(() => {
    const expiresAt = nextExpiry(messages, ttlMs);
    if (expiresAt === null) return;

    let timer: ReturnType<typeof setTimeout>;
    // Retry shortly if the timer fires a moment before the clock agrees.
    const check = () => {
      if (!pruneExpired()) timer = setTimeout(check, 1000);
    };
    timer = setTimeout(check, Math.max(0, expiresAt - Date.now()));

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") pruneExpired();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [messages, ttlMs]);

  const sendMessage = (text: string, model: string | null) => {
    if (pending) return;

    const userMessage = createMessage("user", text);
    const history = [
      ...removeExpired(messages, userMessage.createdAt, ttlMs),
      userMessage,
    ];
    setMessages((prev) => [...prev, userMessage]);
    setFailed(false);

    const controller = new AbortController();
    replyController.current = controller;
    setPending(true);

    void (async () => {
      // The reply appears with its first text; its time (for auto-delete) is
      // when it started.
      let replyId: string | null = null;
      try {
        for await (const text of streamReply(history, model, controller.signal)) {
          if (!text) continue;
          if (replyId === null) {
            const reply = createMessage("assistant", text);
            replyId = reply.id;
            setMessages((prev) => [...prev, reply]);
          } else {
            const id = replyId;
            setMessages((prev) =>
              prev.map((message) => (message.id === id ? { ...message, content: text } : message)),
            );
          }
        }
      } catch (error) {
        // Stopped: keep what arrived. Failed: keep it too, with a notice.
        if (controller.signal.aborted) return;
        setFailed(true);
        // Log the error only; message content must never reach the console.
        console.error("Failed to generate a reply:", error);
      } finally {
        if (replyController.current === controller) {
          replyController.current = null;
          setPending(false);
        }
      }
    })();
  };

  /** Keeps what has arrived. */
  const stopReply = () => {
    replyController.current?.abort();
  };

  /** Also cancels a reply in progress. */
  const clearMessages = () => {
    replyController.current?.abort();
    replyController.current = null;
    startTransition(() => {
      addTransitionType(MESSAGE_EXPIRE_TRANSITION);
      setPending(false);
      setFailed(false);
      setMessages([]);
    });
  };

  return { messages, pending, failed, sendMessage, stopReply, clearMessages };
}
