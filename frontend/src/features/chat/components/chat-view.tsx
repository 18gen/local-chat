"use client";

import { useRef } from "react";

import { PageHeader } from "@/components/page-header";
import { useChatContext } from "@/features/chat/chat-provider";
import { nextExpiry } from "@/features/chat/message-retention";
import { ModelSelect } from "@/features/model/components/model-select";
import { useModelChoice } from "@/features/model/use-model-choice";
import { cn } from "@/lib/utils";
import { t } from "@/locales";
import { Composer } from "./composer";
import { ExpireTransition } from "./expire-transition";
import { MessageList } from "./message-list";
import { NewChatButton } from "./new-chat-button";
import { RetentionSelect } from "./retention-select";

export function ChatView() {
  const {
    messages,
    pending,
    failed,
    sendMessage,
    stopReply,
    clearMessages,
    ttlMs,
    setTtlMs,
  } = useChatContext();
  const { models, model, setModel } = useModelChoice();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  return (
    <>
      <PageHeader>
        <NewChatButton
          disabled={isEmpty}
          onConfirm={clearMessages}
          composerRef={composerRef}
        />
        <RetentionSelect ttlMs={ttlMs} onTtlChange={setTtlMs} messages={messages} />
      </PageHeader>

      {/* One layout for both states keeps the composer mounted, so a half-written
          message, focus and IME input survive the chat emptying. */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isEmpty && "items-center justify-center gap-6 pb-16",
        )}
      >
        {/* Different keys, so the list fades out and the title fades in. */}
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
            {failed && (
              <p role="alert" className="text-caption text-destructive">
                {t.chat.failed}
              </p>
            )}
            <Composer
              ref={composerRef}
              onSend={(text) => sendMessage(text, model)}
              pending={pending}
              onStop={stopReply}
              actions={
                <ModelSelect
                  models={models}
                  value={model}
                  onValueChange={setModel}
                  className="rounded-full border-transparent text-muted-foreground shadow-none hover:bg-muted data-[size=default]:h-9.5 dark:bg-transparent"
                />
              }
            />
            <p className="text-center text-caption text-muted-foreground">
              {t.chat.aiDisclaimer}
            </p>
          </div>
        </ExpireTransition>
      </div>
    </>
  );
}
