import { useEffect } from "react";

import {
  isWorkflowId,
  sortByFavorite,
  WORKFLOWS,
  type WorkflowId,
} from "@/features/workflow/workflows";
import { useFlip } from "@/hooks/use-flip";
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

// Run just before a star changes, while the old order is still shown, so
// every list can slide to the new one.
const beforeChangeListeners = new Set<() => void>();

/**
 * The workflows, favorites first. Put `listRef` on the list and mark its
 * items with `data-flip-id`: they slide into place when a star changes here
 * or in another list.
 */
export function useWorkflowList() {
  const favorites = favoriteWorkflows.use();
  const { containerRef, capture } = useFlip<HTMLUListElement>();

  useEffect(() => {
    beforeChangeListeners.add(capture);
    return () => {
      beforeChangeListeners.delete(capture);
    };
  }, [capture]);

  const toggleFavorite = (id: WorkflowId) => {
    beforeChangeListeners.forEach((listener) => listener());
    favoriteWorkflows.set(
      favorites.includes(id)
        ? favorites.filter((favorite) => favorite !== id)
        : [...favorites, id],
    );
  };

  return {
    listRef: containerRef,
    workflows: sortByFavorite(WORKFLOWS, favorites),
    isFavorite: (id: WorkflowId) => favorites.includes(id),
    toggleFavorite,
  };
}
