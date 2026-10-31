import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import type { ChatMessage } from "@/features/chat/types";
import { MessageRow } from "./message-row";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: ChatMessage[];
  pending: boolean;
};

// Follows shadcn's Message Scroller docs: your message is the scroll anchor,
// so a new question settles near the top with the reply below it; autoScroll
// follows a reply only while you're at the latest message; and reopening a
// chat lands on its last question instead of the very bottom.
export function MessageList({ messages, pending }: MessageListProps) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          {/* gap-3 instead of the default gap-6: each message already has an action row. */}
          <MessageScrollerContent
            aria-busy={pending}
            className="mx-auto w-full max-w-3xl gap-3 px-4 py-6"
          >
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <MessageRow message={message} />
              </MessageScrollerItem>
            ))}
            {pending && (
              <MessageScrollerItem>
                <TypingIndicator />
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
