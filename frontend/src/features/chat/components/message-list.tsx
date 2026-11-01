import { ArrowDownIcon } from "lucide-react";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import type { ChatMessage } from "@/features/chat/types";
import { t } from "@/locales";
import { ExpiryCheckpoint } from "./expiry-checkpoint";
import { MessageRow } from "./message-row";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: ChatMessage[];
  pending: boolean;
  /** When the oldest message is deleted, or null if there are none. */
  oldestExpiresAt: number | null;
};

// Follows shadcn's Message Scroller docs: your message is the scroll anchor,
// so a new question settles near the top with the reply below it; autoScroll
// follows a reply only while you're at the latest message; and reopening a
// chat lands on its last question instead of the very bottom.
export function MessageList({ messages, pending, oldestExpiresAt }: MessageListProps) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <MessageScroller className="flex-1">
        {/* Replaces the library's default English label, "Messages". */}
        <MessageScrollerViewport aria-label={t.chat.transcript}>
          {/* gap-3 instead of the default gap-6: each message already has an action row. */}
          <MessageScrollerContent
            aria-busy={pending}
            className="mx-auto w-full max-w-3xl gap-3 px-4 py-6"
          >
            {/* Sits above the oldest message, the next one to be deleted. */}
            {oldestExpiresAt !== null && (
              <MessageScrollerItem>
                <ExpiryCheckpoint expiresAt={oldestExpiresAt} />
              </MessageScrollerItem>
            )}
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
        {/* Same as the default children, with a Japanese label. */}
        <MessageScrollerButton className="rounded-full">
          <ArrowDownIcon />
          <span className="sr-only">{t.chat.scrollToLatest}</span>
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
