import { afterEach, expect, test, vi } from "vitest";

import { streamText } from "@/lib/api";

const START = { type: "start" };
const FINISH = { type: "finish" };
const delta = (text: string) => ({ type: "text-delta", id: "text", delta: text });

function sse(...events: object[]): string {
  return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
}

/** Makes fetch answer with a stream that arrives in the given pieces. */
function respondWith(pieces: string[], status = 200) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      pieces.forEach((piece) => controller.enqueue(encoder.encode(piece)));
      controller.close();
    },
  });
  const fetchMock = vi.fn(async () => new Response(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function collect(signal = new AbortController().signal): Promise<string[]> {
  const texts: string[] = [];
  for await (const text of streamText("/api/chat", { messages: [] }, signal)) {
    texts.push(text);
  }
  return texts;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("yields the reply so far with each piece of text", async () => {
  respondWith([sse(START, delta("こん"), delta("にちは"), FINISH), "data: [DONE]\n\n"]);
  expect(await collect()).toEqual(["こん", "こんにちは"]);
});

test("posts the body as JSON, keeping it out of the URL", async () => {
  const fetchMock = respondWith([sse(START, FINISH)]);
  await collect();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/chat",
    expect.objectContaining({ method: "POST", body: JSON.stringify({ messages: [] }) }),
  );
});

test("reads events split across network chunks", async () => {
  const whole = sse(START, delta("こんにちは"), FINISH);
  respondWith([whole.slice(0, 30), whole.slice(30)]);
  expect(await collect()).toEqual(["こんにちは"]);
});

test("drops the blank line models sometimes open with", async () => {
  respondWith([sse(START, delta("\n\n"), delta("本文"), FINISH)]);
  expect(await collect()).toEqual(["", "本文"]);
});

test("fails on an error event, after what arrived before it", async () => {
  respondWith([sse(START, delta("途中"), { type: "error", errorText: "The model is unavailable." })]);
  const texts: string[] = [];
  const reading = (async () => {
    for await (const text of streamText("/api/chat", {}, new AbortController().signal)) {
      texts.push(text);
    }
  })();
  await expect(reading).rejects.toThrow("POST /api/chat failed");
  expect(texts).toEqual(["途中"]);
});

test("fails when the stream ends without finish, so a cut-off reply never passes for a whole one", async () => {
  respondWith([sse(START, delta("途中"))]);
  await expect(collect()).rejects.toThrow("POST /api/chat failed");
});

test("fails when the server refuses the request", async () => {
  respondWith([], 422);
  await expect(collect()).rejects.toThrow("POST /api/chat failed");
});

test("names only the path in its error, never what the response said", async () => {
  respondWith(["data: 患者の情報を含む壊れた応答\n\n"]);
  const error = await collect().catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe("POST /api/chat failed");
});

test("stops with the signal's reason when aborted", async () => {
  const controller = new AbortController();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("network");
    }),
  );
  controller.abort(new Error("stopped"));
  await expect(collect(controller.signal)).rejects.toThrow("stopped");
});
