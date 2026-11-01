// How long chat messages are kept, as pure functions of the current time so
// they can be tested without timers.
import type { ChatMessage } from "@/features/chat/types";

const HOUR_MS = 60 * 60 * 1000;

// For manual testing, set NEXT_PUBLIC_CHAT_MESSAGE_TTL_MINUTES in .env.local
// (e.g. 1): the options then count in that many minutes instead of hours.
const unitOverrideMinutes = Number(
  process.env.NEXT_PUBLIC_CHAT_MESSAGE_TTL_MINUTES,
);
const TTL_UNIT_MS =
  Number.isFinite(unitOverrideMinutes) && unitOverrideMinutes > 0
    ? unitOverrideMinutes * 60 * 1000
    : HOUR_MS;

/** Selectable retention times: 1, 2 or 3 hours. */
export const DEFAULT_TTL_MS = TTL_UNIT_MS;
export const TTL_OPTIONS_MS = [
  // Development only: 5 seconds, to watch deletion without waiting.
  ...(process.env.NODE_ENV === "development" ? [5_000] : []),
  ...[1, 2, 3].map((count) => count * TTL_UNIT_MS),
];

export function isTtlOption(value: unknown): value is number {
  return typeof value === "number" && TTL_OPTIONS_MS.includes(value);
}

export function isExpired(
  message: ChatMessage,
  now: number,
  ttlMs: number,
): boolean {
  return now - message.createdAt >= ttlMs;
}

export function removeExpired(
  messages: ChatMessage[],
  now: number,
  ttlMs: number,
): ChatMessage[] {
  return messages.filter((message) => !isExpired(message, now, ttlMs));
}

/** When the oldest message expires, or null if there are none. */
export function nextExpiry(
  messages: ChatMessage[],
  ttlMs: number,
): number | null {
  return messages.length > 0
    ? Math.min(...messages.map((message) => message.createdAt)) + ttlMs
    : null;
}
