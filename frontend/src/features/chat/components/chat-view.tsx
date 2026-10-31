"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChatSession } from "@/features/chat/chat-session";
import { Composer } from "./composer";
import { MessageList } from "./message-list";

export function ChatView() {
  const { activeConversation, pendingConversationId, sendMessage } =
    useChatSession();
  const messages = activeConversation?.messages ?? [];
  const pending =
    activeConversation !== null &&
    pendingConversationId === activeConversation.id;
  const canSend = pendingConversationId === null;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 px-3">
        {/* On mobile the closed sidebar is fully hidden, so it needs an opener here. */}
        <SidebarTrigger className="md:hidden" />
        <span className="truncate font-medium">{activeConversation?.title}</span>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-16">
          <h1 className="text-2xl font-semibold">What can I help with?</h1>
          <div className="w-full max-w-3xl">
            <Composer onSend={sendMessage} disabled={!canSend} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} pending={pending} />
          </div>
          <div className="mx-auto w-full max-w-3xl px-4 pb-4">
            <Composer onSend={sendMessage} disabled={!canSend} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Replies are placeholders until the model is connected.
            </p>
          </div>
        </>
      )}
    </>
  );
}
