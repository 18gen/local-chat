import type { Patient } from "@/features/patient/types";

/** At most this many patients come back; `hasMore` says there were more. */
export const PATIENT_SEARCH_LIMIT = 20;

export type PatientSearchResult = {
  patients: Patient[];
  hasMore: boolean;
};

const PATH = "/api/patients/search";

// The backend asks the hospital's records. POST keeps names out of URLs and
// logs; nothing here stores or logs the query or the result.
export async function searchPatients(
  query: string,
  signal: AbortSignal,
): Promise<PatientSearchResult> {
  const response = await fetch(PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!response.ok) throw new Error(`POST ${PATH} failed`);
  const result: unknown = await response.json();
  if (!isSearchResult(result)) throw new Error(`POST ${PATH} returned no patients`);
  return result;
}

function isSearchResult(value: unknown): value is PatientSearchResult {
  if (typeof value !== "object" || value === null) return false;
  const { patients, hasMore } = value as Record<string, unknown>;
  return Array.isArray(patients) && typeof hasMore === "boolean";
}
