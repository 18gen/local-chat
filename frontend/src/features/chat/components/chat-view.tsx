"use client";

import { PageHeader } from "@/components/page-header";
import { useChat } from "@/features/chat/use-chat";
import { useMessageTtl } from "@/features/chat/use-message-ttl";
import { t } from "@/locales";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { RetentionSelect } from "./retention-select";

export function ChatView() {
  const { ttlMs, setTtlMs } = useMessageTtl();
  const { messages, pending, sendMessage } = useChat(ttlMs);

  return (
    <>
      <PageHeader>
        <span className="font-medium">{t.nav.chat}</span>
        <RetentionSelect ttlMs={ttlMs} onTtlChange={setTtlMs} messages={messages} />
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
