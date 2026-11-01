import { useSyncExternalStore } from "react";

import { isWorkflowId, type WorkflowId } from "@/features/workflow/workflows";

// Starred workflows are a UI preference, like the theme: only workflow IDs
// are stored, never patient data or chat content. If storage is blocked,
// stars still work for the current page.
const STORAGE_KEY = "local-chat:favorite-workflows";
const EMPTY: readonly WorkflowId[] = [];

const listeners = new Set<() => void>();
const beforeChangeListeners = new Set<() => void>();
let cache: { raw: string | null; ids: readonly WorkflowId[] } = {
  raw: null,
  ids: EMPTY,
};

function parse(raw: string | null): readonly WorkflowId[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isWorkflowId) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// Returns the same array until the stored value changes, as
// useSyncExternalStore requires.
function getSnapshot(): readonly WorkflowId[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache.ids;
  }
  if (raw !== cache.raw) cache = { raw, ids: parse(raw) };
  return cache.ids;
}

function getServerSnapshot(): readonly WorkflowId[] {
  return EMPTY;
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

/**
 * Runs just before the user changes a star, while the page still shows the
 * old order, so lists can animate to the new one. Returns an unsubscribe.
 */
export function onBeforeFavoritesChange(listener: () => void) {
  beforeChangeListeners.add(listener);
  return () => {
    beforeChangeListeners.delete(listener);
  };
}

function save(ids: readonly WorkflowId[]) {
  beforeChangeListeners.forEach((listener) => listener());
  const raw = JSON.stringify(ids);
  cache = { raw, ids };
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Storage unavailable; the in-memory cache still holds the change.
  }
  listeners.forEach((listener) => listener());
}

export function useFavoriteWorkflows() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleFavorite = (id: WorkflowId) => {
    save(
      favorites.includes(id)
        ? favorites.filter((favorite) => favorite !== id)
        : [...favorites, id],
    );
  };

  return { favorites, toggleFavorite };
}
