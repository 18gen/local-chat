import { t } from "@/locales";

/** A countdown as MM:SS, or H:MM:SS from an hour up, e.g. "59:42". */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

/** A length of time in words, e.g. "1時間" (or "5秒" under a minute). */
export function formatDuration(ms: number): string {
  if (ms < 60_000) return t.durationSeconds(Math.round(ms / 1000));
  const totalMinutes = Math.round(ms / 60_000);
  return t.duration(Math.floor(totalMinutes / 60), totalMinutes % 60);
}
