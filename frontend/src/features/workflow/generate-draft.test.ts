import { afterEach, expect, test, vi } from "vitest";

import { streamDraft, type DraftSource } from "@/features/workflow/generate-draft";

const PATIENT = "00012345";
const STAY = "00012345-2";
const NO_NOTES = { noteCount: null, notesFrom: null, notesTo: null };

function respondWith(about: object) {
  const events = [
    { type: "start", messageMetadata: about },
    { type: "text-delta", id: "text", delta: "下書き" },
    { type: "finish" },
  ];
  const body = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body)));
}

async function draft(encounterId: string | null) {
  const texts: string[] = [];
  const sources: (DraftSource | null)[] = [];
  const signal = new AbortController().signal;
  const request = { workflowId: "discharge-summary", patientId: PATIENT, encounterId, notes: "" } as const;
  const stream = streamDraft(request, null, signal, (source) => sources.push(source));
  const done = (async () => {
    for await (const text of stream) texts.push(text);
  })();
  return { texts, sources, done };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("reports which notes the draft was made from", async () => {
  const source = { noteCount: 7, notesFrom: "2026-11-01", notesTo: "2026-11-10" };
  respondWith({ patientId: PATIENT, encounterId: STAY, ...source });
  const { texts, sources, done } = await draft(STAY);
  await done;
  expect(texts).toEqual(["下書き"]);
  expect(sources).toEqual([source]);
});

test("reports no source for a draft from the notes alone", async () => {
  respondWith({ patientId: PATIENT, encounterId: null, ...NO_NOTES });
  const { sources, done } = await draft(null);
  await done;
  expect(sources).toEqual([null]);
});

test.each([
  ["another patient", { patientId: "00098765", encounterId: STAY }],
  ["another stay", { patientId: PATIENT, encounterId: "00012345-1" }],
  ["no one", {}],
])("refuses a draft for %s before showing any of its text", async (_, about) => {
  respondWith(about);
  const { texts, done } = await draft(STAY);
  await expect(done).rejects.toThrow("POST /api/drafts failed");
  expect(texts).toEqual([]);
});
