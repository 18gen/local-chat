import type { Patient } from "@/features/patient/types";
import { postJson } from "@/lib/api";

/** At most this many patients come back; `hasMore` says there were more. */
export const PATIENT_SEARCH_LIMIT = 20;

export type PatientSearchResult = {
  patients: Patient[];
  hasMore: boolean;
};

// POST keeps names out of URLs and logs; nothing here stores the query.
export async function searchPatients(
  query: string,
  signal: AbortSignal,
): Promise<PatientSearchResult> {
  const result = await postJson("/api/patients/search", { query }, signal);
  if (!isSearchResult(result)) throw new Error("Patient search returned no patients");
  return result;
}

function isSearchResult(value: unknown): value is PatientSearchResult {
  if (typeof value !== "object" || value === null) return false;
  const { patients, hasMore } = value as Record<string, unknown>;
  return Array.isArray(patients) && typeof hasMore === "boolean";
}
