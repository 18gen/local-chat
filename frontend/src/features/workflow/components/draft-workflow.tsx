"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelect } from "@/features/model/components/model-select";
import { useModelChoice } from "@/features/model/use-model-choice";
import { EncounterPicker } from "@/features/patient/components/encounter-picker";
import { PatientPicker } from "@/features/patient/components/patient-picker";
import { defaultEncounterId } from "@/features/patient/list-encounters";
import type { Patient } from "@/features/patient/types";
import { useEncounters } from "@/features/patient/use-encounters";
import { useDraft } from "@/features/workflow/use-draft";
import type { DraftWorkflowId } from "@/features/workflow/workflows";
import { t } from "@/locales";
import { DraftResult } from "./draft-result";
import { GenerateButton } from "./generate-button";
import { StopButton } from "./stop-button";

/**
 * The patient → notes → draft screen. Everything entered stays in this
 * component's state, so leaving the screen discards it.
 */
export function DraftWorkflow({ workflowId }: { workflowId: DraftWorkflowId }) {
  const text = t.workflow.items[workflowId];
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState("");
  const { draft, setDraft, status, generate, stop, reset } = useDraft(workflowId);
  const { models, model, setModel } = useModelChoice();
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const notesId = useId();
  const generating = status === "generating";
  const locked = generating || draft !== null;

  const { encounters, status: encountersStatus } = useEncounters(patient?.id ?? null);
  // Undefined until staff choose: the workflow's default stay then applies.
  const [chosenEncounterId, setChosenEncounterId] = useState<string | null | undefined>(undefined);
  const encounterId =
    chosenEncounterId === undefined
      ? defaultEncounterId(encounters, workflowId === "discharge-summary")
      : chosenEncounterId;

  // Notes and the stay belong to the patient, so they go when the patient
  // changes. The notes field opens once a patient is chosen, then takes focus.
  const changePatient = (next: Patient | null) => {
    flushSync(() => {
      setPatient(next);
      setChosenEncounterId(undefined);
      setNotes("");
      reset();
    });
    if (next) notesRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PatientPicker
          value={patient}
          onChange={changePatient}
          locked={locked}
          confirmChange={notes.trim() !== ""}
        />
        <EncounterPicker
          encounters={encounters}
          status={encountersStatus}
          value={encounterId}
          onChange={setChosenEncounterId}
          disabled={locked}
        />
      </div>

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
            disabled={!patient || locked}
            // Four lines tall.
            className="min-h-32.5 p-2 text-body"
          />
          <FieldDescription>{t.workflow.inputDescription}</FieldDescription>
        </Field>
        {draft === null && (
          <div className="flex flex-wrap items-center gap-3">
            <ModelSelect
              models={models}
              value={model}
              onValueChange={setModel}
              disabled={generating}
              className="px-3 text-body data-[size=default]:h-11"
            />
            <GenerateButton
              generating={generating}
              // Not before the stays arrive: the draft must use the one shown.
              disabled={!patient || generating || encountersStatus === "loading"}
              onGenerate={() => patient && generate(patient.id, encounterId, notes, model)}
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
