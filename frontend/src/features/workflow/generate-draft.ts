import { withModel } from "@/features/model/models";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

/** Only IDs go up: the backend reads the patient and the chart itself. */
export type DraftRequest = {
  workflowId: DraftWorkflowId;
  patientId: string;
  /** Null: draft from the notes alone. */
  encounterId: string | null;
  notes: string;
};

/** The chart notes a draft was made from; dates are YYYY-MM-DD. */
export type DraftSource = { noteCount: number; notesFrom: string | null; notesTo: string | null };

type About = Partial<DraftSource> & { patientId?: string; encounterId?: string | null };

// Nothing is stored, and a draft for another patient or stay is refused.
// `onSource` gets null when the draft is from the notes alone.
export function streamDraft(
  request: DraftRequest,
  model: string | null,
  signal: AbortSignal,
  onSource: (source: DraftSource | null) => void,
): AsyncGenerator<string> {
  return streamText(withModel("/api/drafts", model), request, signal, (metadata) => {
    const about = (metadata ?? {}) as About;
    if (about.patientId !== request.patientId || about.encounterId !== request.encounterId) {
      throw new Error("The draft is for another patient or stay");
    }
    onSource(
      typeof about.noteCount === "number"
        ? {
            noteCount: about.noteCount,
            notesFrom: about.notesFrom ?? null,
            notesTo: about.notesTo ?? null,
          }
        : null,
    );
  });
}
