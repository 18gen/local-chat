"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { generateReply } from "@/features/chat/generate-reply";
import type { ChatMessage, Conversation } from "@/features/chat/types";

type ChatSession = {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  /** The conversation waiting on a reply. Only one reply runs at a time. */
  pendingConversationId: string | null;
  selectConversation: (id: string) => void;
  startNewChat: () => void;
  sendMessage: (text: string) => void;
};

const ChatSessionContext = createContext<ChatSession | null>(null);

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error("useChatSession must be used within a ChatSessionProvider.");
  }
  return context;
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

function toTitle(text: string): string {
  const line = text.split("\n")[0];
  return line.length > 40 ? `${line.slice(0, 40)}…` : line;
}

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);
  const replyController = useRef<AbortController | null>(null);

  // Cancel an in-flight reply if the session goes away.
  useEffect(() => {
    return () => replyController.current?.abort();
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  const appendMessage = (conversationId: string, message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
  };

  const sendMessage = (text: string) => {
    if (pendingConversationId !== null) return;

    const userMessage = createMessage("user", text);
    let conversationId: string;
    let history: ChatMessage[];

    if (activeConversation) {
      conversationId = activeConversation.id;
      history = [...activeConversation.messages, userMessage];
      appendMessage(conversationId, userMessage);
    } else {
      const conversation: Conversation = {
        id: crypto.randomUUID(),
        title: toTitle(text),
        messages: [userMessage],
      };
      conversationId = conversation.id;
      history = conversation.messages;
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
    }

    const controller = new AbortController();
    replyController.current = controller;
    setPendingConversationId(conversationId);

    generateReply(history, controller.signal)
      .then((reply) =>
        appendMessage(conversationId, createMessage("assistant", reply)),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        // An error state in the UI comes with the real backend.
        console.error("Failed to generate a reply:", error);
      })
      .finally(() => {
        if (replyController.current === controller) {
          replyController.current = null;
          setPendingConversationId(null);
        }
      });
  };

  return (
    <ChatSessionContext.Provider
      value={{
        conversations,
        activeConversation,
        pendingConversationId,
        selectConversation: setActiveId,
        startNewChat: () => setActiveId(null),
        sendMessage,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}
