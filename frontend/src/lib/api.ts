/**
 * POSTs JSON to the backend and returns its JSON. Paths start with /api,
 * which next.config.ts forwards to the backend. Requests use POST so chat and
 * patient content stays out of URLs and server logs; errors carry only the
 * path and status, never the content.
 */
export async function postJson<T>(
  path: `/api/${string}`,
  body: unknown,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}
