import { withModel } from "@/features/model/models";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { streamText } from "@/lib/api";

/** The chart notes a draft was made from; dates are YYYY-MM-DD. */
export type DraftSource = { noteCount: number; notesFrom: string | null; notesTo: string | null };

type About = Partial<DraftSource> & { patientId?: string; encounterId?: string | null };

// Only IDs go up; the backend reads the chart. Nothing is stored, and a draft
// for another patient or stay is refused. `onSource` gets null when the draft
// is from the notes alone.
export function streamDraft(
  workflowId: DraftWorkflowId,
  patientId: string,
  encounterId: string | null,
  notes: string,
  model: string | null,
  signal: AbortSignal,
  onSource: (source: DraftSource | null) => void,
): AsyncGenerator<string> {
  return streamText(
    withModel("/api/drafts", model),
    { workflowId, patientId, encounterId, notes },
    signal,
    (metadata) => {
      const about = (metadata ?? {}) as About;
      if (about.patientId !== patientId || about.encounterId !== encounterId) {
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
    },
  );
}
