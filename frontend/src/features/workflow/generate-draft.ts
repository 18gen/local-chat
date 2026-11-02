import type { Patient } from "@/features/patient/types";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

// Drafts from the patient and the notes, which may be empty, yielding the
// draft so far as it streams in. Nothing here stores the input or the result.
export function streamDraft(
  workflowId: DraftWorkflowId,
  patient: Patient,
  notes: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText("/api/drafts", { workflowId, patient, notes }, signal);
}
