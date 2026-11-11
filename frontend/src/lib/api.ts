type StreamChunk = { type: string; delta?: string; messageMetadata?: unknown };

// POST keeps patient data out of URLs, and so out of logs.
function post(path: string, body: object, signal: AbortSignal): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

/** POSTs JSON and returns the JSON answer. Errors name only the path. */
export async function postJson(
  path: `/api/${string}`,
  body: object,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await post(path, body, signal);
  if (!response.ok) throw new Error(`POST ${path} failed`);
  return response.json();
}

/**
 * POSTs JSON and yields the reply's text so far from an AI SDK UI message
 * stream. Throws on an error event or a stream without "finish", so a
 * cut-off reply never passes for a whole one; errors name only the path, as
 * a response can echo the request.
 * `onStart` gets what the reply says about itself before any text; if it
 * throws, the reply is refused.
 */
export async function* streamText(
  path: `/api/${string}`,
  body: object,
  signal: AbortSignal,
  onStart?: (metadata: unknown) => void,
): AsyncGenerator<string> {
  const failed = () => (signal.aborted ? signal.reason : new Error(`POST ${path} failed`));

  let response: Response;
  try {
    response = await post(path, body, signal);
  } catch {
    throw failed();
  }
  if (!response.ok || !response.body) throw failed();

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  let finished = false;
  let started = onStart === undefined;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const data = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!data || data === "[DONE]") continue;
        const chunk = JSON.parse(data) as StreamChunk;
        if (chunk.type === "error") throw new Error(chunk.type);
        if (chunk.type === "finish") finished = true;
        if (chunk.type === "start" && onStart) {
          onStart(chunk.messageMetadata);
          started = true;
        }
        if (chunk.type === "text-delta" && chunk.delta) {
          if (!started) throw new Error("text before start");
          text += chunk.delta;
          // Models sometimes open with a blank line.
          yield text.trimStart();
        }
      }
    }
  } catch {
    throw failed();
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (!finished) throw failed();
}
