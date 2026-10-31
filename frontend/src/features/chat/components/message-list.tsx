"use client";

import { useEffect, useRef } from "react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { CopyButton } from "./copy-button";
import type { ChatMessage } from "@/features/chat/types";

type MessageListProps = {
  messages: ChatMessage[];
  pending: boolean;
};

export function MessageList({ messages, pending }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        // shadcn's Message and Bubble default to text-sm; text-base keeps 16px.
        return (
          <Message
            key={message.id}
            align={isUser ? "end" : "start"}
            className="text-base"
          >
            <MessageContent className="gap-1">
              {isUser ? (
                <Bubble align="end" variant="muted">
                  <BubbleContent className="rounded-3xl px-4 py-2 text-base whitespace-pre-wrap">
                    {message.content}
                  </BubbleContent>
                </Bubble>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
              {/* Follows the message alignment: right for you, left for replies.
                  Your actions stay hidden until hover or keyboard focus on
                  mouse/trackpad devices; touch screens always show them. */}
              <MessageFooter
                className={
                  isUser
                    ? "transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/message:opacity-100 pointer-fine:group-focus-within/message:opacity-100"
                    : undefined
                }
              >
                <CopyButton text={message.content} />
              </MessageFooter>
            </MessageContent>
          </Message>
        );
      })}
      {pending && (
        <div
          className="flex gap-1 py-2"
          role="status"
          aria-label="Assistant is typing"
        >
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
