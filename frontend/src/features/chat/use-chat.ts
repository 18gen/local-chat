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

/** Transition type for deletions (expiry or a new chat); message rows animate only for this. */
export const MESSAGE_EXPIRE_TRANSITION = "message-expire";

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
}

/**
 * The AI chat's messages, kept in memory only: nothing is written to storage,
 * cookies or the console, so reloading or closing the tab ends the
 * conversation. Used by ChatProvider in the app layout, so it keeps running
 * while other pages are open. Messages older than `ttlMs` are deleted, and
 * changing it applies to the messages shown.
 */
export function useChat(ttlMs: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  // The last reply couldn't be created; cleared by the next message.
  const [failed, setFailed] = useState(false);
  const replyController = useRef<AbortController | null>(null);

  // Cancel an in-flight reply if the chat goes away, e.g. on the 404 page,
  // which is outside the app layout.
  useEffect(() => {
    return () => replyController.current?.abort();
  }, []);

  /** Deletes expired messages. Returns false if none had expired yet. */
  const pruneExpired = useEffectEvent((): boolean => {
    const now = Date.now();
    if (countExpired(messages, now, ttlMs) === 0) return false;
    // A typed transition, so only the message rows animate (see MessageList).
    startTransition(() => {
      addTransitionType(MESSAGE_EXPIRE_TRANSITION);
      setMessages((prev) => removeExpired(prev, now, ttlMs));
    });
    return true;
  });

  // Expiry compares the clock with each message's createdAt instead of
  // counting down, so it stays correct when background tabs throttle timers
  // or the computer sleeps. Returning to the tab checks again.
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

  const sendMessage = (text: string) => {
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
      // The reply appears with its first text and grows from there. Its time
      // is when it started, for auto-delete.
      let replyId: string | null = null;
      try {
        for await (const text of streamReply(history, controller.signal)) {
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

  /** Stops the reply in progress, keeping what has arrived. */
  const stopReply = () => {
    replyController.current?.abort();
  };

  /** Deletes the whole conversation, cancelling a reply in progress. */
  const clearMessages = () => {
    replyController.current?.abort();
    replyController.current = null;
    // Animates like the last messages expiring.
    startTransition(() => {
      addTransitionType(MESSAGE_EXPIRE_TRANSITION);
      setPending(false);
      setFailed(false);
      setMessages([]);
    });
  };

  return { messages, pending, failed, sendMessage, stopReply, clearMessages };
}
