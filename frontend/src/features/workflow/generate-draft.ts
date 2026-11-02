import type { Patient } from "@/features/patient/types";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

// Notes may be empty. Nothing here stores the input or the result.
export function streamDraft(
  workflowId: DraftWorkflowId,
  patient: Patient,
  notes: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText("/api/drafts", { workflowId, patient, notes }, signal);
}
