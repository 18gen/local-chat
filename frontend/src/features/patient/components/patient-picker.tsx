"use client";

import { useId, useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import type { Patient } from "@/features/patient/types";
import { t } from "@/locales";
import { PatientCard } from "./patient-card";
import { PatientSearch } from "./patient-search";

type PatientPickerProps = {
  value: Patient | null;
  onChange: (patient: Patient | null) => void;
  /** No changing, e.g. once a draft exists. */
  locked?: boolean;
  /** Ask first: a change discards what was entered for this patient. */
  confirmChange?: boolean;
};

/**
 * Search for the patient, then show them. Controlled, so each workflow
 * decides what a change resets.
 */
export function PatientPicker({
  value,
  onChange,
  locked = false,
  confirmChange = false,
}: PatientPickerProps) {
  const id = useId();
  // After a change, the search box takes focus from the button it replaces.
  const [changed, setChanged] = useState(false);

  const change = () => {
    setChanged(true);
    onChange(null);
  };

  return (
    <Field>
      {value ? (
        <>
          <FieldTitle className="text-body">{t.patient.label}</FieldTitle>
          <PatientCard
            patient={value}
            action={
              locked ? null : <ChangeButton confirm={confirmChange} onChange={change} />
            }
          />
        </>
      ) : (
        <>
          <FieldLabel htmlFor={id} className="text-body">
            {t.patient.label}
          </FieldLabel>
          <PatientSearch id={id} autoFocus={changed} onSelect={onChange} />
          <FieldDescription>{t.patient.hint}</FieldDescription>
        </>
      )}
    </Field>
  );
}

function ChangeButton({
  confirm,
  onChange,
}: {
  confirm: boolean;
  onChange: () => void;
}) {
  const button = (
    <Button
      variant="outline"
      aria-label={t.patient.changeLabel}
      onClick={confirm ? undefined : onChange}
    >
      {t.patient.change}
    </Button>
  );
  if (!confirm) return button;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.patient.changeTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.patient.changeDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onChange}>{t.patient.changeConfirm}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
