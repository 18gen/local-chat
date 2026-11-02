import type { Patient } from "@/features/patient/types";
import { t } from "@/locales";

/** Age in whole years on `today`, from a YYYY-MM-DD birth date. */
function ageOn(birthDate: string, today: Date): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const hadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1);
}

/**
 * What tells this patient apart from others with the same or a similar name.
 * ID and birth date come first: with the name, they are the two identifiers
 * patient safety guidelines ask staff to check.
 */
export function patientDetails(patient: Patient, today: Date): string[] {
  return [
    t.patient.id(patient.id),
    t.patient.birth(
      patient.birthDate.replaceAll("-", "/"),
      ageOn(patient.birthDate, today),
    ),
    t.patient.genders[patient.gender],
    patient.admission
      ? t.patient.inpatient(patient.admission.ward, patient.admission.room)
      : t.patient.outpatient,
    patient.department,
  ];
}
