/** The models the backend offers, its default first. */
export async function fetchModels(signal: AbortSignal): Promise<string[]> {
  const response = await fetch("/api/models", { signal });
  if (!response.ok) throw new Error("GET /api/models failed");
  const { models }: { models?: unknown } = await response.json();
  if (!isStringArray(models)) throw new Error("GET /api/models returned no list");
  return models;
}

/** Without a model, the backend uses its default. */
export function withModel(path: `/api/${string}`, model: string | null): `/api/${string}` {
  return model === null ? path : `${path}?${new URLSearchParams({ model })}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
