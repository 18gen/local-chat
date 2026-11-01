"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  InfoIcon,
  RotateCcwIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { generateDraft } from "@/features/workflow/generate-draft";
import { SAMPLE_INPUTS } from "@/features/workflow/mock-drafts";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { t } from "@/locales";

// Larger than the default button, for comfortable use by all staff.
const LARGE_BUTTON = "h-11 px-5 text-base";

type Status = "idle" | "generating" | "ready" | "failed";

/**
 * The shared notes → draft screen. Input and draft live only in this
 * component's state, so leaving the screen discards them.
 */
export function DraftWorkflow({ workflowId }: { workflowId: DraftWorkflowId }) {
  const text = t.workflow.items[workflowId];
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);
  const draftSection = useRef<HTMLElement>(null);
  const { state: copyState, copy } = useCopyToClipboard();
  const inputId = useId();
  const draftId = useId();

  // Cancel generation when the screen goes away.
  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  // Bring the new draft into view; it appears below the input.
  useEffect(() => {
    if (status === "ready") {
      draftSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  const generating = status === "generating";

  const generate = () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus("generating");
    generateDraft(workflowId, input, current.signal)
      .then((result) => {
        setDraft(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!current.signal.aborted) setStatus("failed");
      });
  };

  const reset = () => {
    controller.current?.abort();
    setInput("");
    setDraft(null);
    setStatus("idle");
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor={inputId} className="text-base">
            {text.inputLabel}
          </FieldLabel>
          <Textarea
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={text.inputPlaceholder}
            disabled={generating || draft !== null}
            className="min-h-48 text-base leading-7"
          />
          <FieldDescription>{t.workflow.inputDescription}</FieldDescription>
        </Field>
        {/* Once a draft exists, start over to generate again so edits aren't overwritten. */}
        {draft === null && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className={LARGE_BUTTON}
              onClick={generate}
              disabled={generating || input.trim().length === 0}
            >
              {generating ? <Spinner aria-hidden /> : <SparklesIcon />}
              {generating ? t.workflow.generating : t.workflow.generate}
            </Button>
            <Button
              variant="outline"
              className={LARGE_BUTTON}
              onClick={() => setInput(SAMPLE_INPUTS[workflowId])}
              disabled={generating}
            >
              {t.workflow.fillSample}
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{t.workflow.mockNotice}</p>
      </section>

      {status === "failed" && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>{t.workflow.failed}</AlertDescription>
        </Alert>
      )}

      {draft !== null && (
        <section ref={draftSection} className="flex scroll-mt-4 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{t.workflow.draftTitle}</h2>
            <Badge variant="outline" className="border-destructive/50 text-destructive">
              {t.workflow.aiDraftBadge}
            </Badge>
          </div>
          <Alert>
            <InfoIcon />
            <AlertDescription>{t.workflow.draftReview}</AlertDescription>
          </Alert>
          <Field>
            <FieldLabel htmlFor={draftId}>{t.workflow.draftLabel}</FieldLabel>
            <Textarea
              id={draftId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-80 text-base leading-7"
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button className={LARGE_BUTTON} onClick={() => void copy(draft)}>
              {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
              {t.copy[copyState]}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className={LARGE_BUTTON}>
                  <RotateCcwIcon />
                  {t.workflow.reset}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.workflow.resetTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.workflow.resetDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.workflow.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={reset}>
                    {t.workflow.resetConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}
    </div>
  );
}
