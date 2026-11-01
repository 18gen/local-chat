"use client";

import { useEffect } from "react";

import { useFlip } from "@/hooks/use-flip";
import {
  onBeforeFavoritesChange,
  useFavoriteWorkflows,
} from "@/features/workflow/use-favorite-workflows";
import { sortByFavorite, WORKFLOWS } from "@/features/workflow/workflows";
import { WorkflowCard } from "./workflow-card";

// Same order as the sidebar: starred first, sliding into place on change.
export function WorkflowGrid() {
  const { favorites, toggleFavorite } = useFavoriteWorkflows();
  const { containerRef, capture } = useFlip<HTMLUListElement>();

  // A star changed anywhere (here or in the sidebar): record positions first.
  useEffect(() => onBeforeFavoritesChange(capture), [capture]);

  return (
    <ul ref={containerRef} className="grid gap-5 sm:grid-cols-2">
      {sortByFavorite(WORKFLOWS, favorites).map((workflow) => (
        <li key={workflow.id} data-flip-id={workflow.id}>
          <WorkflowCard
            workflow={workflow}
            starred={favorites.includes(workflow.id)}
            onToggleFavorite={() => toggleFavorite(workflow.id)}
          />
        </li>
      ))}
    </ul>
  );
}
