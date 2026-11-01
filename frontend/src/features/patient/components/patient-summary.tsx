import { Badge } from "@/components/ui/badge";
import { patientDetails } from "@/features/patient/patient-format";
import type { Patient } from "@/features/patient/types";
import { t } from "@/locales";

// The same identification in search results and once chosen, so staff
// compare like with like.
export function PatientSummary({ patient }: { patient: Patient }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-x-2">
        <span className="text-body font-semibold">{patient.name}</span>
        <span className="text-caption text-muted-foreground">{patient.kana}</span>
        {patient.hasNamesake && (
          // A highlighted search result recolors all its text; `!` keeps the
          // warning red.
          <Badge
            variant="outline"
            className="border-destructive/50 text-destructive in-data-highlighted:text-destructive!"
          >
            {t.patient.namesake}
          </Badge>
        )}
      </div>
      <p className="flex flex-wrap gap-x-3 text-caption text-muted-foreground">
        {patientDetails(patient, new Date()).map((detail) => (
          <span key={detail}>{detail}</span>
        ))}
      </p>
    </div>
  );
}
