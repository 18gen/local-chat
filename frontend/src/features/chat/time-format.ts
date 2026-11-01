import { t } from "@/locales";

/** A length of time in words, e.g. "1時間" (or "5秒" under a minute). */
export function formatDuration(ms: number): string {
  if (ms < 60_000) return t.durationSeconds(Math.round(ms / 1000));
  const totalMinutes = Math.round(ms / 60_000);
  return t.duration(Math.floor(totalMinutes / 60), totalMinutes % 60);
}
