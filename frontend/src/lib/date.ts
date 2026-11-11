/** A YYYY-MM-DD date as staff read it: YYYY/MM/DD. */
export function formatDate(date: string): string {
  return date.replaceAll("-", "/");
}
