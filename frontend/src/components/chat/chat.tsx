"use client";

import { useEffect, useRef, useState } from "react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import type { Conversation, Message } from "./types";

// Placeholder until the backend is connected.
const MOCK_REPLY = "This is a placeholder reply. The model isn't connected yet.";
const MOCK_DELAY_MS = 800;

function createMessage(role: Message["role"], content: string): Message {
  return { id: crypto.randomUUID(), role, content };
}

function toTitle(text: string): string {
  const line = text.split("\n")[0];
  return line.length > 40 ? `${line.slice(0, 40)}…` : line;
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const pending = pendingId !== null && pendingId === activeId;

  const appendMessage = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
  };

  const handleSend = (text: string) => {
    const userMessage = createMessage("user", text);
    let conversationId = activeId;

    if (conversationId === null) {
      const conversation: Conversation = {
        id: crypto.randomUUID(),
        title: toTitle(text),
        messages: [userMessage],
      };
      conversationId = conversation.id;
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
    } else {
      appendMessage(conversationId, userMessage);
    }

    const targetId = conversationId;
    setPendingId(targetId);
    replyTimer.current = setTimeout(() => {
      appendMessage(targetId, createMessage("assistant", MOCK_REPLY));
      setPendingId(null);
      replyTimer.current = null;
    }, MOCK_DELAY_MS);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={() => setActiveId(null)}
      />
      <SidebarInset className="h-svh">
        <header className="flex h-12 shrink-0 items-center gap-2 px-3">
          {/* On mobile the closed sidebar is fully hidden, so it needs an opener here. */}
          <SidebarTrigger className="md:hidden" />
          <span className="truncate font-medium">
            {active?.title}
          </span>
        </header>

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-16">
            <h1 className="text-2xl font-semibold">What can I help with?</h1>
            <div className="w-full max-w-3xl">
              <Composer onSend={handleSend} disabled={pendingId !== null} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} pending={pending} />
            </div>
            <div className="mx-auto w-full max-w-3xl px-4 pb-4">
              <Composer onSend={handleSend} disabled={pendingId !== null} />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Replies are placeholders until the model is connected.
              </p>
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
