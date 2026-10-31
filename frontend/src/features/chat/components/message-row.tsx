import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import type { ChatMessage } from "@/features/chat/types";
import { CopyButton } from "./copy-button";

export function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  // shadcn's Message and Bubble default to text-sm; text-base keeps 16px.
  return (
    <Message align={isUser ? "end" : "start"} className="text-base">
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
}
