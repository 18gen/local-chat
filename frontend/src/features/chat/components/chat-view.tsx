"use client";

import { useRef } from "react";

import { PageHeader } from "@/components/page-header";
import { useChatContext } from "@/features/chat/chat-provider";
import { nextExpiry } from "@/features/chat/message-retention";
import { cn } from "@/lib/utils";
import { t } from "@/locales";
import { Composer } from "./composer";
import { ExpireTransition } from "./expire-transition";
import { MessageList } from "./message-list";
import { NewChatButton } from "./new-chat-button";
import { RetentionSelect } from "./retention-select";

export function ChatView() {
  const { messages, pending, sendMessage, clearMessages, ttlMs, setTtlMs } =
    useChatContext();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  return (
    <>
      {/* The sidebar and the tab already name this page, so the header holds
          the main action on the left and the auto-delete setting on the right. */}
      <PageHeader>
        <NewChatButton
          disabled={isEmpty}
          onConfirm={clearMessages}
          composerRef={composerRef}
        />
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
            <h1 className="text-title">{t.chat.emptyTitle}</h1>
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
            <Composer ref={composerRef} onSend={sendMessage} disabled={pending} />
            <p className="text-center text-caption text-muted-foreground">
              {t.chat.aiDisclaimer}
            </p>
          </div>
        </ExpireTransition>
      </div>
    </>
  );
}
