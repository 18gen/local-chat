"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
import { PatientPicker } from "@/features/patient/components/patient-picker";
import type { Patient } from "@/features/patient/types";
import { generateDraft } from "@/features/workflow/generate-draft";
import { SAMPLE_INPUTS } from "@/features/workflow/mock-drafts";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { t } from "@/locales";

type Status = "idle" | "generating" | "ready" | "failed";

/**
 * The shared patient → notes → draft screen. The patient, input and draft
 * live only in this component's state, so leaving the screen discards them.
 */
export function DraftWorkflow({ workflowId }: { workflowId: DraftWorkflowId }) {
  const text = t.workflow.items[workflowId];
  const [patient, setPatient] = useState<Patient | null>(null);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  // The notes belong to the patient, so they go when the patient changes.
  // The notes field opens once a patient is chosen, then takes focus.
  const changePatient = (next: Patient | null) => {
    flushSync(() => {
      setPatient(next);
      setInput("");
      setStatus("idle");
    });
    if (next) inputRef.current?.focus();
  };

  const generate = () => {
    if (!patient) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus("generating");
    generateDraft(workflowId, patient, input, current.signal)
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
      <PatientPicker
        value={patient}
        onChange={changePatient}
        locked={generating || draft !== null}
        confirmChange={input.trim() !== ""}
      />

      <section className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor={inputId} className="text-body">
            {text.inputLabel}
          </FieldLabel>
          <Textarea
            ref={inputRef}
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={text.inputPlaceholder}
            disabled={!patient || generating || draft !== null}
            className="min-h-48 p-2 text-body"
          />
          <FieldDescription>{t.workflow.inputDescription}</FieldDescription>
        </Field>
        {/* Once a draft exists, start over to generate again so edits aren't overwritten. */}
        {draft === null && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="xl"
              onClick={generate}
              disabled={!patient || generating || input.trim().length === 0}
            >
              {generating ? <Spinner aria-hidden /> : <SparklesIcon />}
              {generating ? t.workflow.generating : t.workflow.generate}
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => setInput(SAMPLE_INPUTS[workflowId])}
              disabled={!patient || generating}
            >
              {t.workflow.fillSample}
            </Button>
          </div>
        )}
        <p className="text-caption text-muted-foreground">{t.workflow.mockNotice}</p>
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
            <h2 className="text-heading">{t.workflow.draftTitle}</h2>
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
              className="min-h-80 text-body"
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button size="xl" onClick={() => void copy(draft)}>
              {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
              {t.copy[copyState]}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="xl">
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
