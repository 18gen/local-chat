import { MOCK_PATIENTS } from "@/features/patient/mock-patients";
import type { Patient } from "@/features/patient/types";
import { mockDelay } from "@/lib/mock-delay";

/** At most this many patients come back; `hasMore` says there were more. */
export const PATIENT_SEARCH_LIMIT = 20;

export type PatientSearchResult = {
  patients: Patient[];
  hasMore: boolean;
};

// Placeholder for the hospital API. The real call should POST the query,
// keeping names out of URLs and logs. Nothing here stores or logs it.
const MOCK_DELAY_MS = 300;

export function searchPatients(
  query: string,
  signal: AbortSignal,
): Promise<PatientSearchResult> {
  const key = normalize(query);
  const matches = key
    ? MOCK_PATIENTS.filter((patient) => matchesPatient(patient, key))
    : [];
  return mockDelay(
    {
      patients: matches.slice(0, PATIENT_SEARCH_LIMIT),
      hasMore: matches.length > PATIENT_SEARCH_LIMIT,
    },
    MOCK_DELAY_MS,
    signal,
  );
}

// Folds width, hiragana/katakana and spaces.
function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/[ぁ-ゖ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0x60),
    );
}

// IDs match from the start, with or without leading zeros; names anywhere.
function matchesPatient(patient: Patient, key: string): boolean {
  return (
    patient.id.startsWith(key) ||
    patient.id.replace(/^0+/, "").startsWith(key) ||
    normalize(patient.name).includes(key) ||
    normalize(patient.kana).includes(key)
  );
}
