"use client";

import { SearchIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { Patient } from "@/features/patient/types";
import {
  usePatientSearch,
  type PatientSearchStatus,
} from "@/features/patient/use-patient-search";
import { t } from "@/locales";
import { PatientSummary } from "./patient-summary";

type PatientSearchProps = {
  id: string;
  onSelect: (patient: Patient) => void;
  autoFocus?: boolean;
};

// The server filters, so the combobox's own filtering is off.
export function PatientSearch({ id, onSelect, autoFocus }: PatientSearchProps) {
  const { patients, hasMore, status, search } = usePatientSearch();
  // Line the list up with the whole box, not the text after the icon.
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={patients}
      filter={null}
      value={null}
      onValueChange={(patient: Patient | null) => {
        if (patient) onSelect(patient);
      }}
      onInputValueChange={(query, { reason }) => {
        if (reason !== "item-press") search(query);
      }}
      itemToStringLabel={(patient: Patient) => patient.name}
      isItemEqualToValue={(item: Patient, value: Patient) => item.id === value.id}
      autoHighlight
    >
      <div ref={anchor}>
        <ComboboxInput
          id={id}
          placeholder={t.patient.searchPlaceholder}
          autoFocus={autoFocus}
          showTrigger={false}
          className="h-11 *:data-[slot=input-group-control]:text-body"
        >
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          {status === "searching" && (
            <InputGroupAddon align="inline-end">
              <Spinner />
            </InputGroupAddon>
          )}
        </ComboboxInput>
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxStatus>
          <SearchStatus status={status} count={patients.length} hasMore={hasMore} />
        </ComboboxStatus>
        <ComboboxList>
          {(patient: Patient) => (
            <ComboboxItem key={patient.id} value={patient} className="py-2 pl-2">
              <PatientSummary patient={patient} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function SearchStatus({
  status,
  count,
  hasMore,
}: {
  status: PatientSearchStatus;
  /** How many patients are listed. */
  count: number;
  hasMore: boolean;
}) {
  if (status === "idle") return t.patient.searchHint;
  if (status === "searching" && count === 0) return t.patient.searching;
  if (status === "error") return t.patient.failed;
  if (status === "done" && count === 0) return t.patient.noResults;
  if (hasMore) return t.patient.narrowDown(count);
  return null;
}
