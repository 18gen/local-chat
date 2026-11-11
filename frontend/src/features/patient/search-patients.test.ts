import { afterEach, expect, test, vi } from "vitest";

import { searchPatients } from "@/features/patient/search-patients";

const signal = new AbortController().signal;

function respondWith(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("posts the query in the body, keeping names out of the URL", async () => {
  const fetchMock = respondWith({ patients: [], hasMore: false });
  expect(await searchPatients("佐藤", signal)).toEqual({ patients: [], hasMore: false });
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/patients/search",
    expect.objectContaining({ method: "POST", body: JSON.stringify({ query: "佐藤" }) }),
  );
});

test("fails when the backend refuses, naming only the path", async () => {
  respondWith({ detail: "佐藤" }, 500);
  await expect(searchPatients("佐藤", signal)).rejects.toThrow(
    "POST /api/patients/search failed",
  );
});

test("fails on an answer that is not a search result", async () => {
  respondWith({ patients: null });
  await expect(searchPatients("佐藤", signal)).rejects.toThrow("returned no patients");
});
