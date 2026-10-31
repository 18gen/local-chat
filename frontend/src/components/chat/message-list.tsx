"use client";

import { useEffect, useRef } from "react";

import type { Message } from "./types";

type MessageListProps = {
  messages: Message[];
  pending: boolean;
};

export function MessageList({ messages, pending }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((message) =>
        message.role === "user" ? (
          <div
            key={message.id}
            className="max-w-[80%] self-end rounded-3xl bg-muted px-4 py-2 whitespace-pre-wrap"
          >
            {message.content}
          </div>
        ) : (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.content}
          </div>
        ),
      )}
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
