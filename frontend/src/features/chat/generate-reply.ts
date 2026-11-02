import type { ChatMessage } from "@/features/chat/types";
import { postJson } from "@/lib/api";

// The rest of the app only depends on this signature. It sends the whole
// conversation, so the server doesn't need to store any chat history.
export async function generateReply(
  history: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const { reply } = await postJson<{ reply: string }>(
    "/api/chat",
    { messages: history.map(({ role, content }) => ({ role, content })) },
    signal,
  );
  return reply;
}
