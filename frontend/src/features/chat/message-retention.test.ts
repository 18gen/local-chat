import { describe, expect, test } from "vitest";

import {
  countExpired,
  isTtlOption,
  nextExpiry,
  oldestExchangeEnd,
  removeExpired,
} from "@/features/chat/message-retention";
import type { ChatMessage } from "@/features/chat/types";

const HOUR = 60 * 60 * 1000;

function message(role: ChatMessage["role"], createdAt: number): ChatMessage {
  return { id: `${role}-${createdAt}`, role, content: "…", createdAt };
}

// Two exchanges, answered at 10 and 50 minutes, then a question still waiting.
const MINUTE = 60 * 1000;
const messages = [
  message("user", 0),
  message("assistant", 10 * MINUTE),
  message("user", 40 * MINUTE),
  message("user", 45 * MINUTE),
  message("assistant", 50 * MINUTE),
  message("user", 55 * MINUTE),
];

describe("removeExpired", () => {
  test("keeps everything until the first response is as old as the TTL", () => {
    expect(removeExpired(messages, 10 * MINUTE + HOUR - 1, HOUR)).toEqual(messages);
  });

  test("deletes a response together with the questions it answered", () => {
    expect(removeExpired(messages, 10 * MINUTE + HOUR, HOUR)).toEqual(messages.slice(2));
  });

  test("times a question from its response, not from when it was asked", () => {
    // The 40-minute question is over an hour old, its response is not.
    const kept = removeExpired(messages, 45 * MINUTE + HOUR, HOUR);
    expect(kept).toEqual(messages.slice(2));
  });

  test("never deletes a question still waiting for its response", () => {
    expect(removeExpired(messages, 100 * HOUR, HOUR)).toEqual(messages.slice(5));
  });
});

test("countExpired counts what removeExpired would delete", () => {
  expect(countExpired(messages, 0, HOUR)).toBe(0);
  expect(countExpired(messages, 10 * MINUTE + HOUR, HOUR)).toBe(2);
  expect(countExpired(messages, 100 * HOUR, HOUR)).toBe(5);
});

describe("nextExpiry", () => {
  test("is when the oldest response reaches the TTL", () => {
    expect(nextExpiry(messages, HOUR)).toBe(10 * MINUTE + HOUR);
  });

  test("is null until a response exists", () => {
    expect(nextExpiry([message("user", 0)], HOUR)).toBeNull();
    expect(nextExpiry([], HOUR)).toBeNull();
  });
});

test("oldestExchangeEnd is the index just past the first response", () => {
  expect(oldestExchangeEnd(messages)).toBe(2);
  expect(oldestExchangeEnd([message("user", 0)])).toBeNull();
});

test("only one, two or three hours can be chosen", () => {
  expect([1, 2, 3].map((hours) => isTtlOption(hours * HOUR))).toEqual([true, true, true]);
  expect(isTtlOption(4 * HOUR)).toBe(false);
  expect(isTtlOption(0)).toBe(false);
  expect(isTtlOption("3600000")).toBe(false);
});
