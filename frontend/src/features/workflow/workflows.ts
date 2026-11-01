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
