import { useEffect, useRef, useState } from "react";

import {
  streamDraft,
  type DraftRequest,
  type DraftSource,
} from "@/features/workflow/generate-draft";

type Status = "idle" | "generating" | "ready" | "failed";

/** A draft streamed in from the model, kept only in this component's state. */
export function useDraft() {
  const [draft, setDraft] = useState<string | null>(null);
  const [source, setSource] = useState<DraftSource | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  const generate = (request: DraftRequest, model: string | null) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus("generating");
    void (async () => {
      try {
        for await (const text of streamDraft(request, model, current.signal, setSource)) {
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
    setSource(null);
    setStatus("idle");
  };

  return { draft, setDraft, source, status, generate, stop, reset };
}
