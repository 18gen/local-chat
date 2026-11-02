import type { ChatMessage } from "@/features/chat/types";
import { withModel } from "@/features/model/models";
import { streamText } from "@/lib/api";

// Sends the whole conversation, so the server keeps no chat history.
export function streamReply(
  history: ChatMessage[],
  model: string | null,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamText(
    withModel("/api/chat", model),
    { messages: history.map(({ role, content }) => ({ role, content })) },
    signal,
  );
}
