// How long chat messages are kept, as pure functions of the current time so
// they can be tested without timers.
import type { ChatMessage } from "@/features/chat/types";

const DEFAULT_TTL_MS = 60 * 60 * 1000;

// For manual testing, set NEXT_PUBLIC_CHAT_MESSAGE_TTL_MINUTES in .env.local
// (e.g. 1). Unset keeps messages for 1 hour.
const ttlOverrideMinutes = Number(
  process.env.NEXT_PUBLIC_CHAT_MESSAGE_TTL_MINUTES,
);

export const MESSAGE_TTL_MS =
  Number.isFinite(ttlOverrideMinutes) && ttlOverrideMinutes > 0
    ? ttlOverrideMinutes * 60 * 1000
    : DEFAULT_TTL_MS;

export function isExpired(message: ChatMessage, now: number): boolean {
  return now - message.createdAt >= MESSAGE_TTL_MS;
}

export function removeExpired(messages: ChatMessage[], now: number): ChatMessage[] {
  return messages.filter((message) => !isExpired(message, now));
}

/** When the oldest message expires, or null if there are none. */
export function nextExpiry(messages: ChatMessage[]): number | null {
  return messages.length > 0
    ? Math.min(...messages.map((message) => message.createdAt)) + MESSAGE_TTL_MS
    : null;
}
