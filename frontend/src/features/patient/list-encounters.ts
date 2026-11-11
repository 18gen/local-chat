import type { Encounter } from "@/features/patient/types";

const PATH = "/api/patients/encounters";

/** The patient's hospital stays, newest first. POST keeps the ID out of URLs. */
export async function listEncounters(
  patientId: string,
  signal: AbortSignal,
): Promise<Encounter[]> {
  const response = await fetch(PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId }),
    signal,
  });
  if (!response.ok) throw new Error(`POST ${PATH} failed`);
  const { encounters }: { encounters?: unknown } = await response.json();
  if (!Array.isArray(encounters)) throw new Error(`POST ${PATH} returned no list`);
  return encounters as Encounter[];
}

/**
 * The stay a workflow starts with. A discharge summary is about a stay, often
 * written after it ended, so it takes the newest; other documents take only a
 * stay still going on, as an old one may have nothing to do with them.
 */
export function defaultEncounterId(
  encounters: readonly Encounter[],
  preferNewest: boolean,
): string | null {
  const newest = encounters.at(0);
  if (!newest) return null;
  return preferNewest || newest.dischargedOn === null ? newest.id : null;
}
