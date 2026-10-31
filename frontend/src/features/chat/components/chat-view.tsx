"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChatSession } from "@/features/chat/chat-session";
import { t } from "@/locales";
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
          <h1 className="text-2xl font-semibold">{t.chat.emptyTitle}</h1>
          <div className="w-full max-w-3xl">
            <Composer onSend={sendMessage} disabled={!canSend} />
          </div>
        </div>
      ) : (
        <>
          {/* Keyed per chat so switching chats reopens each at its last question. */}
          <MessageList
            key={activeConversation?.id}
            messages={messages}
            pending={pending}
          />
          <div className="mx-auto w-full max-w-3xl px-4 pb-4">
            <Composer onSend={sendMessage} disabled={!canSend} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t.chat.placeholderNotice}
            </p>
          </div>
        </>
      )}
    </>
  );
}
