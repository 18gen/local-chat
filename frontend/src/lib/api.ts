type StreamChunk = { type: string; delta?: string };

/**
 * POSTs JSON and yields the reply's text so far from an AI SDK UI message
 * stream. POST keeps patient data out of URLs and logs. Throws on an error
 * event or a stream without "finish", so a cut-off reply never passes for a
 * whole one; errors name only the path, as a response can echo the request.
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
