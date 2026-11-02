import type { Patient } from "@/features/patient/types";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { postJson } from "@/lib/api";

// Drafts from the patient and the notes, which may be empty. Nothing here
// stores the input or the result.
export async function generateDraft(
  workflowId: DraftWorkflowId,
  patient: Patient,
  notes: string,
  signal: AbortSignal,
): Promise<string> {
  const { draft } = await postJson<{ draft: string }>(
    "/api/drafts",
    { workflowId, patient, notes },
    signal,
  );
  return draft;
}
