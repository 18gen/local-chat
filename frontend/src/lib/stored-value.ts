import { useSyncExternalStore } from "react";

/**
 * A UI preference kept in localStorage (never chat or patient data), shared
 * by every component and kept in sync across tabs. If storage is blocked, a
 * change still holds for this page. `parse` returns null for a missing or
 * invalid value, which falls back to `fallback`.
 */
export function createStoredValue<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T | null,
  serialize: (value: T) => string = String,
) {
  const listeners = new Set<() => void>();
  let unsaved: T | null = null;
  // useSyncExternalStore needs the same value back until the stored text
  // changes, which matters for arrays and objects.
  let cache: { raw: string; value: T | null } | null = null;

  const get = (): T => {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return unsaved ?? fallback;
    }
    if (raw === null) return unsaved ?? fallback;
    if (cache?.raw !== raw) cache = { raw, value: parse(raw) };
    return cache.value ?? fallback;
  };

  const set = (value: T) => {
    unsaved = value;
    try {
      localStorage.setItem(key, serialize(value));
    } catch {
      // Storage unavailable; `unsaved` keeps the change for this page.
    }
    listeners.forEach((listener) => listener());
  };

  /** Calls `listener` when the value changes here or in another tab. */
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  };

  const use = () => useSyncExternalStore(subscribe, get, () => fallback);

  return { get, set, subscribe, use };
}
