type StreamChunk = { type: string; delta?: string };

/**
 * POSTs JSON to a backend endpoint that streams its reply as an AI SDK UI
 * message stream (server-sent events), yielding the text so far as it grows.
 * POST keeps chat and patient content out of URLs and server logs.
 *
 * Throws if the request fails, the server sends an error, or the stream ends
 * without "finish", so a cut-off reply is never taken for a whole one. Errors
 * name only the path: a response can echo the request's patient data.
 */
export async function* streamText(
  path: `/api/${string}`,
  body: object,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const failed = () => (signal.aborted ? signal.reason : new Error(`POST ${path} failed`));

  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw failed();
  }
  if (!response.ok || !response.body) throw failed();

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  let finished = false;
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
        if (chunk.type === "text-delta" && chunk.delta) {
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
