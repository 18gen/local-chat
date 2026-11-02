import {
  DefaultChatTransport,
  readUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

/**
 * POSTs JSON to a backend endpoint that streams its reply in AI SDK's UI
 * message stream format, yielding the reply's text so far each time it grows.
 * Paths start with /api, which next.config.ts forwards to the backend. POST
 * keeps chat and patient content out of URLs and server logs.
 *
 * Throws if the request fails, the server reports an error, or the stream
 * ends before "finish" (e.g. a dropped connection), so a cut-off reply is
 * never taken for a whole one. Errors name only the path: the server's
 * response can echo the request, which must never reach the console.
 */
export async function* streamText(
  path: `/api/${string}`,
  body: object,
  signal: AbortSignal,
): AsyncGenerator<string> {
  // AI SDK's reader for its own format; the request body is ours.
  const transport = new DefaultChatTransport<UIMessage>({
    api: path,
    prepareSendMessagesRequest: () => ({ body }),
  });

  let finished = false;
  try {
    const chunks = await transport.sendMessages({
      chatId: path,
      messages: [],
      abortSignal: signal,
      trigger: "submit-message",
      messageId: undefined,
    });
    const checked = chunks.pipeThrough(
      new TransformStream<UIMessageChunk, UIMessageChunk>({
        transform(chunk, controller) {
          if (chunk.type === "error") throw new Error("error event");
          if (chunk.type === "finish") finished = true;
          controller.enqueue(chunk);
        },
      }),
    );
    for await (const message of readUIMessageStream({ stream: checked, terminateOnError: true })) {
      const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
      // Models sometimes open with a blank line.
      yield text.trimStart();
    }
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(`POST ${path} failed`);
  }
  if (!finished && !signal.aborted) throw new Error(`POST ${path} ended early`);
}
