import { useEffect, useRef, useState } from "react";

import {
  searchPatients,
  type PatientSearchResult,
} from "@/features/patient/search-patients";

export type PatientSearchStatus = "idle" | "searching" | "done" | "error";

const DEBOUNCE_MS = 250;

const NO_RESULT: PatientSearchResult = { patients: [], hasMore: false };

/** Searches as the query changes; a newer query cancels the one in flight. */
export function usePatientSearch() {
  const [result, setResult] = useState(NO_RESULT);
  const [status, setStatus] = useState<PatientSearchStatus>("idle");
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A search still waiting on the debounce starts aborted and stops at once.
  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  const search = (query: string) => {
    clearTimeout(timer.current);
    controller.current?.abort();
    if (query.trim() === "") {
      setResult(NO_RESULT);
      setStatus("idle");
      return;
    }

    const current = new AbortController();
    controller.current = current;
    setStatus("searching");
    timer.current = setTimeout(() => {
      searchPatients(query, current.signal)
        .then((next) => {
          setResult(next);
          setStatus("done");
        })
        .catch(() => {
          if (!current.signal.aborted) setStatus("error");
        });
    }, DEBOUNCE_MS);
  };

  return { ...result, status, search };
}
