import type { Patient } from "@/features/patient/types";
import { MOCK_DRAFTS } from "@/features/workflow/mock-drafts";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { mockDelay } from "@/lib/mock-delay";

// Placeholder until the backend is connected: returns a fixed fictional draft
// for the patient, regardless of the input. Replace the body with the API call; nothing here
// stores the input or the result.
const MOCK_DELAY_MS = 1200;

export function generateDraft(
  workflowId: DraftWorkflowId,
  patient: Patient,
  _input: string,
  signal: AbortSignal,
): Promise<string> {
  return mockDelay(MOCK_DRAFTS[workflowId](patient), MOCK_DELAY_MS, signal);
}
