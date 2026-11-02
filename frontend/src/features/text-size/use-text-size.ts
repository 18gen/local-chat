import { useSyncExternalStore } from "react";

import {
  DEFAULT_TEXT_SIZE,
  readSavedTextSize,
  TEXT_SIZE_STORAGE_KEY,
  type TextSize,
} from "@/features/text-size/text-size";

const listeners = new Set<() => void>();
// The choice when storage is blocked, so it still holds on this page.
let unsaved: TextSize | null = null;

export function getTextSize(): TextSize {
  return readSavedTextSize() ?? unsaved ?? DEFAULT_TEXT_SIZE;
}

function getServerSnapshot(): TextSize {
  return DEFAULT_TEXT_SIZE;
}

/** Calls `listener` when the size changes here or in another tab. */
export function subscribeTextSize(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Saves the size; TextSizeSync applies it to the page. */
function setTextSize(size: TextSize) {
  unsaved = size;
  try {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // Storage unavailable; `unsaved` keeps the choice for this page.
  }
  listeners.forEach((listener) => listener());
}

export function useTextSize() {
  const textSize = useSyncExternalStore(
    subscribeTextSize,
    getTextSize,
    getServerSnapshot,
  );
  return { textSize, setTextSize };
}
