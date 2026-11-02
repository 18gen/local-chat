import { isWorkflowId, type WorkflowId } from "@/features/workflow/workflows";
import { createStoredValue } from "@/lib/stored-value";

const NONE: readonly WorkflowId[] = [];

const favoriteWorkflows = createStoredValue<readonly WorkflowId[]>(
  "local-chat:favorite-workflows",
  NONE,
  (raw) => {
    try {
      const value: unknown = JSON.parse(raw);
      return Array.isArray(value) ? value.filter(isWorkflowId) : null;
    } catch {
      return null;
    }
  },
  (ids) => JSON.stringify(ids),
);

const beforeChangeListeners = new Set<() => void>();

/**
 * Runs just before a star changes, while the old order is still shown, so
 * lists can animate to the new one.
 */
export function onBeforeFavoritesChange(listener: () => void) {
  beforeChangeListeners.add(listener);
  return () => {
    beforeChangeListeners.delete(listener);
  };
}

export function useFavoriteWorkflows() {
  const favorites = favoriteWorkflows.use();

  const toggleFavorite = (id: WorkflowId) => {
    beforeChangeListeners.forEach((listener) => listener());
    favoriteWorkflows.set(
      favorites.includes(id)
        ? favorites.filter((favorite) => favorite !== id)
        : [...favorites, id],
    );
  };

  return { favorites, toggleFavorite };
}
