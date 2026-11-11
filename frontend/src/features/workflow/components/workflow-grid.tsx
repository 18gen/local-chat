"use client";

import { useWorkflowList } from "@/features/workflow/use-favorite-workflows";
import { WorkflowCard } from "./workflow-card";

export function WorkflowGrid() {
  const { listRef, workflows, isFavorite, toggleFavorite } = useWorkflowList();

  return (
    <ul ref={listRef} className="grid gap-5 sm:grid-cols-2">
      {workflows.map((workflow) => (
        <li key={workflow.id} data-flip-id={workflow.id}>
          <WorkflowCard
            workflow={workflow}
            starred={isFavorite(workflow.id)}
            onToggleFavorite={() => toggleFavorite(workflow.id)}
          />
        </li>
      ))}
    </ul>
  );
}
