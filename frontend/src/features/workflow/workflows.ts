import {
  BookOpenIcon,
  FileHeartIcon,
  NotebookTextIcon,
  SendIcon,
  type LucideIcon,
} from "lucide-react";

// The built-in workflows. Their text lives in t.workflow.items[id].

/** Workflows that turn notes into an editable draft on the shared screen. */
export type DraftWorkflowId =
  | "discharge-summary"
  | "referral-letter"
  | "note-summary";

export type WorkflowId = DraftWorkflowId | "manual-search";

export type Workflow =
  | { id: DraftWorkflowId; kind: "draft"; icon: LucideIcon }
  | { id: "manual-search"; kind: "coming-soon"; icon: LucideIcon };

export const WORKFLOWS: readonly Workflow[] = [
  { id: "discharge-summary", kind: "draft", icon: FileHeartIcon },
  { id: "referral-letter", kind: "draft", icon: SendIcon },
  { id: "note-summary", kind: "draft", icon: NotebookTextIcon },
  // Search returns documents with sources, not a draft, so it needs its own screen.
  { id: "manual-search", kind: "coming-soon", icon: BookOpenIcon },
];

export function getWorkflow(id: string): Workflow | undefined {
  return WORKFLOWS.find((workflow) => workflow.id === id);
}

/** A workflow's page. Short like ChatGPT's /g/; the list stays at /workflows. */
export function workflowHref(id: WorkflowId) {
  return `/w/${id}`;
}

export function isWorkflowId(value: unknown): value is WorkflowId {
  return WORKFLOWS.some((workflow) => workflow.id === value);
}

/**
 * Favorites first, most recently starred on top (`favorites` is kept in the
 * order stars were added); the rest keep their original order.
 */
export function sortByFavorite(
  workflows: readonly Workflow[],
  favorites: readonly WorkflowId[],
): Workflow[] {
  const rank = (workflow: Workflow) => {
    const index = favorites.indexOf(workflow.id);
    return index === -1 ? -1 : index;
  };
  return [...workflows].sort((a, b) => rank(b) - rank(a));
}
