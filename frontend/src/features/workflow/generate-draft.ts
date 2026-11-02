import { withModel } from "@/features/model/models";
import type { Patient } from "@/features/patient/types";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

// Notes may be empty. Nothing here stores the input or the result.
export function streamDraft(
  workflowId: DraftWorkflowId,
  patient: Patient,
  notes: string,
  model: string | null,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText(withModel("/api/drafts", model), { workflowId, patient, notes }, signal);
}
