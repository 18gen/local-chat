import type { ChatMessage } from "@/features/chat/types";
import { streamText } from "@/lib/api";

// Sends the whole conversation, so the server keeps no chat history.
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
