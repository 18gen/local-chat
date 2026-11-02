"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { PatientPicker } from "@/features/patient/components/patient-picker";
import type { Patient } from "@/features/patient/types";
import { useDraft } from "@/features/workflow/use-draft";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { t } from "@/locales";
import { DraftResult } from "./draft-result";
import { GenerateButton } from "./generate-button";
import { StopButton } from "./stop-button";

/**
 * The shared patient → notes → draft screen. Everything entered lives only
 * in this component's state, so leaving the screen discards it.
 */
export function DraftWorkflow({ workflowId }: { workflowId: DraftWorkflowId }) {
  const text = t.workflow.items[workflowId];
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState("");
  const { draft, setDraft, status, generate, stop, reset } = useDraft(workflowId);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const notesId = useId();
  const generating = status === "generating";

  // Notes belong to the patient, so they go when the patient changes. The
  // notes field opens once a patient is chosen, then takes focus.
  const changePatient = (next: Patient | null) => {
    flushSync(() => {
      setPatient(next);
      setNotes("");
      reset();
    });
    if (next) notesRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-10">
      <PatientPicker
        value={patient}
        onChange={changePatient}
        locked={generating || draft !== null}
        confirmChange={notes.trim() !== ""}
      />

      <section className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor={notesId} className="text-body">
            {text.inputLabel}
          </FieldLabel>
          <Textarea
            ref={notesRef}
            id={notesId}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={text.inputPlaceholder}
            disabled={!patient || generating || draft !== null}
            // Four lines tall; it grows with longer notes.
            className="min-h-32.5 p-2 text-body"
          />
          <FieldDescription>{t.workflow.inputDescription}</FieldDescription>
        </Field>
        {/* Once there's a draft, starting over is the way to draft again. */}
        {draft === null && (
          <div className="flex flex-wrap items-center gap-3">
            <GenerateButton
              generating={generating}
              disabled={!patient || generating}
              onGenerate={() => patient && generate(patient, notes)}
            />
            {generating && <StopButton onClick={stop} />}
          </div>
        )}
      </section>

      {status === "failed" && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>{t.workflow.failed}</AlertDescription>
        </Alert>
      )}

      {draft !== null && (
        <DraftResult
          draft={draft}
          onChange={setDraft}
          generating={generating}
          onStop={stop}
          onReset={() => {
            setNotes("");
            reset();
          }}
        />
      )}
    </div>
  );
}
