import { useEffect, useEffectEvent, useState } from "react";

export type FetchStatus = "idle" | "loading" | "ready" | "failed";

/**
 * What `load` returns for `key`, in memory only. A null key fetches nothing,
 * and an answer for an earlier key never shows for the current one.
 */
export function useFetched<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [loaded, setLoaded] = useState<{ key: string; data: T | null } | null>(null);
  const loadLatest = useEffectEvent(load);

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    loadLatest(controller.signal).then(
      (data) => setLoaded({ key, data }),
      () => {
        if (!controller.signal.aborted) setLoaded({ key, data: null });
      },
    );
    return () => controller.abort();
  }, [key]);

  const current = loaded?.key === key ? loaded : null;
  const status: FetchStatus =
    key === null ? "idle" : current === null ? "loading" : current.data === null ? "failed" : "ready";
  return { data: current?.data ?? null, status };
}
