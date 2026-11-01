import type { ReactNode } from "react";
import { TriangleAlertIcon } from "lucide-react";

import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import type { Patient } from "@/features/patient/types";
import { t } from "@/locales";
import { PatientSummary } from "./patient-summary";

type PatientCardProps = {
  patient: Patient;
  /** E.g. a button to change the patient. */
  action?: ReactNode;
};

/** The chosen patient, shown for as long as the workflow runs. */
export function PatientCard({ patient, action }: PatientCardProps) {
  return (
    <Item variant="outline">
      <ItemContent className="gap-2">
        <PatientSummary patient={patient} />
        {patient.hasNamesake && (
          <p className="flex items-center gap-1.5 text-caption text-warning">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden />
            {t.patient.namesakeWarning}
          </p>
        )}
      </ItemContent>
      {action && <ItemActions>{action}</ItemActions>}
    </Item>
  );
}
