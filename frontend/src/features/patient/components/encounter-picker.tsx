"use client";

import { useId } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Encounter } from "@/features/patient/types";
import type { FetchStatus } from "@/hooks/use-fetched";
import { t } from "@/locales";

// Radio values are strings; this one stands for "no stay".
const NO_ENCOUNTER = "none";

type EncounterPickerProps = {
  encounters: readonly Encounter[];
  status: FetchStatus;
  /** Null: draft from the notes alone. */
  value: string | null;
  onChange: (encounterId: string | null) => void;
  disabled?: boolean;
};

/** Which hospital stay's chart to draft from; hidden if there are none. */
export function EncounterPicker({
  encounters,
  status,
  value,
  onChange,
  disabled = false,
}: EncounterPickerProps) {
  const id = useId();

  if (status === "loading") {
    return <p className="text-caption text-muted-foreground">{t.encounter.loading}</p>;
  }
  if (status === "failed") {
    return (
      <p role="alert" className="text-caption text-destructive">
        {t.encounter.failed}
      </p>
    );
  }
  if (encounters.length === 0) return null;

  return (
    <FieldSet>
      <FieldLegend variant="label" className="text-body">
        {t.encounter.label}
      </FieldLegend>
      <FieldDescription>{t.encounter.hint}</FieldDescription>
      <RadioGroup
        value={value ?? NO_ENCOUNTER}
        onValueChange={(next) => onChange(next === NO_ENCOUNTER ? null : next)}
        disabled={disabled}
      >
        {encounters.map((encounter) => (
          <Option
            key={encounter.id}
            id={`${id}-${encounter.id}`}
            value={encounter.id}
            title={t.encounter.period(
              formatDate(encounter.admittedOn),
              encounter.dischargedOn && formatDate(encounter.dischargedOn),
            )}
            description={t.encounter.place(encounter.department, encounter.ward, encounter.room)}
          />
        ))}
        <Option id={`${id}-none`} value={NO_ENCOUNTER} title={t.encounter.none} />
      </RadioGroup>
    </FieldSet>
  );
}

function Option({
  id,
  value,
  title,
  description,
}: {
  id: string;
  value: string;
  title: string;
  description?: string;
}) {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        <RadioGroupItem value={value} id={id} />
        <FieldContent>
          <FieldTitle className="text-body">{title}</FieldTitle>
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      </Field>
    </FieldLabel>
  );
}

function formatDate(date: string): string {
  return date.replaceAll("-", "/");
}
