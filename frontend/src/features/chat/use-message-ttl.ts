import { useSyncExternalStore } from "react";

import { DEFAULT_TTL_MS, isTtlOption } from "@/features/chat/message-retention";

// The chosen retention time is a UI preference, like the starred workflows:
// only the number is stored, never chat content. Unknown or missing values
// fall back to the default; if storage is blocked, it holds for the page.
const STORAGE_KEY = "local-chat:message-ttl";

const listeners = new Set<() => void>();
let inMemory: number | null = null;

function getSnapshot(): number {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (isTtlOption(stored)) return stored;
  } catch {
    // Storage unavailable; fall through to the in-memory value.
  }
  return inMemory ?? DEFAULT_TTL_MS;
}

function getServerSnapshot(): number {
  return DEFAULT_TTL_MS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other tabs in sync.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function save(ttlMs: number) {
  inMemory = ttlMs;
  try {
    localStorage.setItem(STORAGE_KEY, String(ttlMs));
  } catch {
    // Storage unavailable; the in-memory value still applies.
  }
  listeners.forEach((listener) => listener());
}

export function useMessageTtl() {
  const ttlMs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ttlMs, setTtlMs: save };
}
