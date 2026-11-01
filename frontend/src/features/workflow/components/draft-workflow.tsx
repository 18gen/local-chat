"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  CheckIcon,
  CommandIcon,
  CopyIcon,
  CornerDownLeftIcon,
  InfoIcon,
  RotateCcwIcon,
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
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useIsMac } from "@/hooks/use-is-mac";
import { PatientPicker } from "@/features/patient/components/patient-picker";
import type { Patient } from "@/features/patient/types";
import { generateDraft } from "@/features/workflow/generate-draft";
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
  // Notes are optional; the patient alone is enough to draft from.
  const canGenerate = patient !== null && !generating && draft === null;

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

  // ⌘Enter (Ctrl+Enter on Windows) works like the button from anywhere on the
  // screen, as the sidebar's ⌘B does; not inside a dialog or while an IME is
  // composing.
  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    if (event.isComposing || event.repeat || !canGenerate) return;
    const target = event.target;
    if (target instanceof Element && target.closest('[role="dialog"], [role="alertdialog"]')) {
      return;
    }
    event.preventDefault();
    generate();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => onShortcut(event);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            // Four lines tall (4 × 1.75rem, plus padding and border); it grows
            // with longer notes.
            className="min-h-32.5 p-2 text-body"
          />
          <FieldDescription>{t.workflow.inputDescription}</FieldDescription>
        </Field>
        {/* Once a draft exists, start over to generate again so edits aren't overwritten. */}
        {draft === null && (
          <Button
            size="xl"
            onClick={generate}
            disabled={!canGenerate}
            aria-keyshortcuts="Meta+Enter Control+Enter"
            className="self-start"
          >
            {generating && <Spinner data-icon="inline-start" aria-hidden />}
            {generating ? t.workflow.generating : t.workflow.generate}
            {!generating && <GenerateShortcut />}
          </Button>
        )}
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
            <Badge variant="warning">
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

// One key cap for the whole shortcut, like the sidebar's ⌘B hint, a size up
// so it reads at a glance on the large button. Mac symbols are icons: the ⌘
// and ⏎ characters draw too thin at this size. Screen readers get the
// button's aria-keyshortcuts instead.
function GenerateShortcut() {
  const mac = useIsMac();
  if (mac === null) return null;
  return (
    <Kbd
      data-icon="inline-end"
      aria-hidden
      className="h-6 min-w-6 translate-x-0.5 gap-0.5 bg-primary-foreground/20 px-1.5 text-caption text-primary-foreground [&_svg:not([class*='size-'])]:size-3.5"
    >
      {mac ? (
        <>
          <CommandIcon />
          <CornerDownLeftIcon />
        </>
      ) : (
        "Ctrl+Enter"
      )}
    </Kbd>
  );
}
