import { useEffect, useRef, useState } from "react";

import type { Patient } from "@/features/patient/types";
import { streamDraft } from "@/features/workflow/generate-draft";
import type { DraftWorkflowId } from "@/features/workflow/workflows";

type Status = "idle" | "generating" | "ready" | "failed";

/** A draft streamed in from the model, kept only in this component's state. */
export function useDraft(workflowId: DraftWorkflowId) {
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  const generate = (patient: Patient, notes: string, model: string | null) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus("generating");
    void (async () => {
      try {
        for await (const text of streamDraft(workflowId, patient, notes, model, current.signal)) {
          if (current.signal.aborted) return;
          if (text) setDraft(text);
        }
        setStatus("ready");
      } catch {
        if (current.signal.aborted) return;
        // A cut-off draft could pass for a whole one, so it goes.
        setDraft(null);
        setStatus("failed");
      }
    })();
  };

  // Keeps what has arrived; with nothing yet, starts over.
  const stop = () => {
    controller.current?.abort();
    setStatus(draft === null ? "idle" : "ready");
  };

  const reset = () => {
    controller.current?.abort();
    setDraft(null);
    setStatus("idle");
  };

  return { draft, setDraft, status, generate, stop, reset };
}
