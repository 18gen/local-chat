import { ArrowDownIcon } from "lucide-react";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { oldestExchangeEnd } from "@/features/chat/message-retention";
import type { ChatMessage } from "@/features/chat/types";
import { t } from "@/locales";
import { ExpireTransition } from "./expire-transition";
import { ExpiryCheckpoint } from "./expiry-checkpoint";
import { MessageRow } from "./message-row";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: ChatMessage[];
  pending: boolean;
  oldestExpiresAt: number | null;
};

// Your message is the scroll anchor, so a question settles near the top and
// its reply grows below it.
export function MessageList({ messages, pending, oldestExpiresAt }: MessageListProps) {
  const rows = messages.map((message) => (
    <ExpireTransition key={message.id}>
      <MessageScrollerItem messageId={message.id} scrollAnchor={message.role === "user"}>
        <MessageRow message={message} />
      </MessageScrollerItem>
    </ExpireTransition>
  ));
  // "Typing" until the reply's first text arrives; then the reply grows.
  if (pending && messages.at(-1)?.role === "user") {
    rows.push(
      <ExpireTransition key="typing">
        <MessageScrollerItem>
          <TypingIndicator />
        </MessageScrollerItem>
      </ExpireTransition>,
    );
  }
  // Below the oldest AI response: everything above it is deleted next.
  const end = oldestExchangeEnd(messages);
  if (oldestExpiresAt !== null && end !== null) {
    rows.splice(
      end,
      0,
      <ExpireTransition key="expiry-checkpoint">
        <MessageScrollerItem>
          <ExpiryCheckpoint expiresAt={oldestExpiresAt} />
        </MessageScrollerItem>
      </ExpireTransition>,
    );
  }

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <MessageScroller className="flex-1">
        <MessageScrollerViewport aria-label={t.chat.transcript}>
          <MessageScrollerContent
            aria-busy={pending}
            className="mx-auto w-full max-w-3xl gap-3 px-4 py-6"
          >
            {rows}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton className="rounded-full">
          <ArrowDownIcon />
          <span className="sr-only">{t.chat.scrollToLatest}</span>
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
