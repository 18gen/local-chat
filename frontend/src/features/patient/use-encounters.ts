import { useEffect, useState } from "react";

import { listEncounters } from "@/features/patient/list-encounters";
import type { Encounter } from "@/features/patient/types";

export type EncountersStatus = "idle" | "loading" | "ready" | "failed";

type Loaded = { patientId: string; encounters: Encounter[] | null };

const NONE: readonly Encounter[] = [];

/** The chosen patient's hospital stays, kept only while that patient is chosen. */
export function useEncounters(patientId: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (patientId === null) return;
    const controller = new AbortController();
    listEncounters(patientId, controller.signal).then(
      (encounters) => setLoaded({ patientId, encounters }),
      () => {
        if (!controller.signal.aborted) setLoaded({ patientId, encounters: null });
      },
    );
    return () => controller.abort();
  }, [patientId]);

  // An answer for an earlier patient never shows for this one.
  const current = loaded?.patientId === patientId ? loaded : null;
  const status: EncountersStatus =
    patientId === null
      ? "idle"
      : current === null
        ? "loading"
        : current.encounters === null
          ? "failed"
          : "ready";
  return { encounters: current?.encounters ?? NONE, status };
}
