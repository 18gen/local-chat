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

// Messages leave an exchange at a time: each AI response together with
// everything sent since the previous response. The response holds the timer,
// so a question still waiting for its answer isn't scheduled yet.
function exchangeTimes(messages: ChatMessage[]): (number | null)[] {
  const times: (number | null)[] = messages.map(() => null);
  let start = 0;
  messages.forEach((message, index) => {
    if (message.role !== "assistant") return;
    times.fill(message.createdAt, start, index + 1);
    start = index + 1;
  });
  return times;
}

export function removeExpired(
  messages: ChatMessage[],
  now: number,
  ttlMs: number,
): ChatMessage[] {
  const times = exchangeTimes(messages);
  return messages.filter((_, index) => {
    const time = times[index];
    return time === null || now - time < ttlMs;
  });
}

export function countExpired(
  messages: ChatMessage[],
  now: number,
  ttlMs: number,
): number {
  return messages.length - removeExpired(messages, now, ttlMs).length;
}

/** When the oldest exchange expires, or null until a response exists. */
export function nextExpiry(
  messages: ChatMessage[],
  ttlMs: number,
): number | null {
  const oldestResponse = messages.find((message) => message.role === "assistant");
  return oldestResponse ? oldestResponse.createdAt + ttlMs : null;
}

/**
 * Index just past the oldest exchange (its AI response): everything before
 * it is deleted next. Null until a response exists.
 */
export function oldestExchangeEnd(messages: ChatMessage[]): number | null {
  const index = messages.findIndex((message) => message.role === "assistant");
  return index === -1 ? null : index + 1;
}
