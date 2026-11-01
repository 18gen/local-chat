import { ViewTransition, type ReactNode } from "react";
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
import { MESSAGE_EXPIRE_TRANSITION } from "@/features/chat/use-chat";
import { t } from "@/locales";
import { ExpiryCheckpoint } from "./expiry-checkpoint";
import { MessageRow } from "./message-row";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: ChatMessage[];
  pending: boolean;
  /** When the oldest exchange is deleted, or null until a response exists. */
  oldestExpiresAt: number | null;
};

// Rows animate only during deletions: the expired exchange fades out while the
// rows below slide up (styles in globals.css). Sending and page navigation
// stay instant. View transitions animate snapshots, so the Message Scroller
// still measures the real layout.
const ON_EXPIRE = {
  [MESSAGE_EXPIRE_TRANSITION]: "message-expire",
  default: "none",
};

function Row({ children }: { children: ReactNode }) {
  return (
    <ViewTransition exit={ON_EXPIRE} update={ON_EXPIRE} default="none">
      {children}
    </ViewTransition>
  );
}

// Follows shadcn's Message Scroller docs: your message is the scroll anchor,
// so a new question settles near the top with the reply below it; autoScroll
// follows a reply only while you're at the latest message; and reopening a
// chat lands on its last question instead of the very bottom.
export function MessageList({ messages, pending, oldestExpiresAt }: MessageListProps) {
  const rows = messages.map((message) => (
    <Row key={message.id}>
      <MessageScrollerItem messageId={message.id} scrollAnchor={message.role === "user"}>
        <MessageRow message={message} />
      </MessageScrollerItem>
    </Row>
  ));
  if (pending) {
    rows.push(
      <Row key="typing">
        <MessageScrollerItem>
          <TypingIndicator />
        </MessageScrollerItem>
      </Row>,
    );
  }
  // The checkpoint sits right below the oldest AI response, so everything
  // above it is what gets deleted next. One flat keyed list lets it slide to
  // its new place.
  const end = oldestExchangeEnd(messages);
  if (oldestExpiresAt !== null && end !== null) {
    rows.splice(
      end,
      0,
      <Row key="expiry-checkpoint">
        <MessageScrollerItem>
          <ExpiryCheckpoint expiresAt={oldestExpiresAt} />
        </MessageScrollerItem>
      </Row>,
    );
  }

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
            {rows}
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
