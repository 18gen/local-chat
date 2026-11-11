import type { Encounter } from "@/features/patient/types";
import { postJson } from "@/lib/api";

/** The patient's hospital stays, newest first. */
export async function listEncounters(
  patientId: string,
  signal: AbortSignal,
): Promise<Encounter[]> {
  const answer = await postJson("/api/patients/encounters", { patientId }, signal);
  const { encounters } = (answer ?? {}) as { encounters?: unknown };
  if (!Array.isArray(encounters)) throw new Error("The answer lists no encounters");
  return encounters as Encounter[];
}

/** The stay chosen at first: one still going on, or the newest if preferred. */
export function defaultEncounterId(
  encounters: readonly Encounter[],
  preferNewest: boolean,
): string | null {
  const newest = encounters.at(0);
  if (!newest) return null;
  return preferNewest || newest.dischargedOn === null ? newest.id : null;
}
