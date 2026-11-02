import type { ChatMessage } from "@/features/chat/types";
import { streamText } from "@/lib/api";

// The rest of the app only depends on this signature. It sends the whole
// conversation, so the server doesn't need to store any chat history, and
// yields the reply's text so far as it streams in.
export function streamReply(
  history: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText(
    "/api/chat",
    { messages: history.map(({ role, content }) => ({ role, content })) },
    signal,
  );
}
