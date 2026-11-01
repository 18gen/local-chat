import { MOCK_PATIENTS } from "@/features/patient/mock-patients";
import type { Patient } from "@/features/patient/types";
import { mockDelay } from "@/lib/mock-delay";

/** At most this many patients come back; `hasMore` says there were more. */
export const PATIENT_SEARCH_LIMIT = 20;

export type PatientSearchResult = {
  patients: Patient[];
  hasMore: boolean;
};

// Placeholder until the hospital API is connected: searches the fictional
// patients in memory. Replace the body with the API call, sending the query
// in a POST body so names stay out of URLs and server logs. Nothing here
// stores or logs the query.
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

// Folds the ways the same text gets typed: full- or half-width, hiragana or
// katakana, with or without spaces.
function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/[ぁ-ゖ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0x60),
    );
}

// The ID matches from its start, with or without its leading zeros; names and
// readings match anywhere.
function matchesPatient(patient: Patient, key: string): boolean {
  return (
    patient.id.startsWith(key) ||
    patient.id.replace(/^0+/, "").startsWith(key) ||
    normalize(patient.name).includes(key) ||
    normalize(patient.kana).includes(key)
  );
}
