"use client";

import { PageHeader } from "@/components/page-header";
import { useChat } from "@/features/chat/use-chat";
import { t } from "@/locales";
import { Composer } from "./composer";
import { MessageList } from "./message-list";

export function ChatView() {
  const { messages, pending, sendMessage } = useChat();

  return (
    <>
      <PageHeader>
        <span className="font-medium">{t.nav.chat}</span>
      </PageHeader>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-16">
          <h1 className="text-2xl font-semibold">{t.chat.emptyTitle}</h1>
          <div className="flex w-full max-w-3xl flex-col gap-3">
            <Composer onSend={sendMessage} disabled={pending} />
            <p className="text-center text-sm text-muted-foreground">
              {t.chat.aiDisclaimer}
            </p>
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} pending={pending} />
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pb-4">
            <Composer onSend={sendMessage} disabled={pending} />
            <p className="text-center text-xs text-muted-foreground">
              {t.chat.aiDisclaimer}
            </p>
          </div>
        </>
      )}
    </>
  );
}
