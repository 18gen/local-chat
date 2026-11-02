import { memo } from "react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import type { ChatMessage } from "@/features/chat/types";
import { CopyButton } from "./copy-button";

// Memoized: while a reply streams in, only that message re-renders.
export const MessageRow = memo(function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <Message align={isUser ? "end" : "start"} className="text-body">
      <MessageContent className="gap-1">
        {isUser ? (
          <Bubble align="end" variant="muted">
            <BubbleContent className="rounded-3xl px-4 py-2 text-body whitespace-pre-wrap">
              {message.content}
            </BubbleContent>
          </Bubble>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
        {/* Your actions show on hover or focus with a mouse; touch screens always
            show them. */}
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
});
