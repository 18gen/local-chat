import { withModel } from "@/features/model/models";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

// Only IDs go up; the backend reads the chart. Nothing is stored, and a draft
// for another patient or stay is refused.
export function streamDraft(
  workflowId: DraftWorkflowId,
  patientId: string,
  encounterId: string | null,
  notes: string,
  model: string | null,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText(
    withModel("/api/drafts", model),
    { workflowId, patientId, encounterId, notes },
    signal,
    { patientId, encounterId },
  );
}
