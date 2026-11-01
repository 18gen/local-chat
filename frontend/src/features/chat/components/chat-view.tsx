"use client";

import { PageHeader } from "@/components/page-header";
import { useChatContext } from "@/features/chat/chat-provider";
import { nextExpiry } from "@/features/chat/message-retention";
import { cn } from "@/lib/utils";
import { t } from "@/locales";
import { Composer } from "./composer";
import { ExpireTransition } from "./expire-transition";
import { MessageList } from "./message-list";
import { RetentionSelect } from "./retention-select";

export function ChatView() {
  const { messages, pending, sendMessage, ttlMs, setTtlMs } = useChatContext();
  const isEmpty = messages.length === 0;

  return (
    <>
      <PageHeader>
        <span className="font-medium">{t.nav.chat}</span>
        <RetentionSelect ttlMs={ttlMs} onTtlChange={setTtlMs} messages={messages} />
      </PageHeader>

      {/* The start screen and the conversation share one layout with the
          composer at the same place in the tree, so React keeps it when the
          last messages expire: a half-written message, focus and IME input
          survive. The composer is the same width in both, so it slides to
          the center cleanly as the messages fade out. */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isEmpty && "items-center justify-center gap-6 pb-16",
        )}
      >
        {/* Different keys, so the messages fade out and the title fades in
            instead of one morphing into the other. */}
        {isEmpty ? (
          <ExpireTransition key="start">
            <h1 className="text-2xl font-semibold">{t.chat.emptyTitle}</h1>
          </ExpireTransition>
        ) : (
          <ExpireTransition key="messages">
            <MessageList
              messages={messages}
              pending={pending}
              oldestExpiresAt={nextExpiry(messages, ttlMs)}
            />
          </ExpireTransition>
        )}
        <ExpireTransition>
          <div
            className={cn(
              "mx-auto flex w-full max-w-3xl flex-col px-4",
              isEmpty ? "gap-3" : "gap-2 pb-4",
            )}
          >
            <Composer onSend={sendMessage} disabled={pending} />
            <p
              className={cn(
                "text-center text-muted-foreground",
                isEmpty ? "text-sm" : "text-xs",
              )}
            >
              {t.chat.aiDisclaimer}
            </p>
          </div>
        </ExpireTransition>
      </div>
    </>
  );
}
