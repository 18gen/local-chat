"use client";

import { createContext, use, type ReactNode } from "react";

import { useChat } from "@/features/chat/use-chat";
import { useMessageTtl } from "@/features/chat/use-message-ttl";

type ChatContextValue = ReturnType<typeof useChat> &
  ReturnType<typeof useMessageTtl>;

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { ttlMs, setTtlMs } = useMessageTtl();
  const chat = useChat(ttlMs);
  return <ChatContext value={{ ...chat, ttlMs, setTtlMs }}>{children}</ChatContext>;
}

export function useChatContext() {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider.");
  }
  return context;
}
