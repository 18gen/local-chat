import { t } from "@/locales";

/** A length of time in words, e.g. "1時間". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  return t.duration(Math.floor(totalMinutes / 60), totalMinutes % 60);
}
