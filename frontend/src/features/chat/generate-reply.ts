import type { ChatMessage } from "@/features/chat/types";
import { mockDelay } from "@/lib/mock-delay";
import { t } from "@/locales";

// Placeholder until the backend is connected. Replace the body with the API
// call; the rest of the app only depends on this signature. It receives the
// whole conversation, so the server doesn't need to store any chat history.
const MOCK_DELAY_MS = 800;

export function generateReply(
  _history: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  return mockDelay(t.chat.mockReply, MOCK_DELAY_MS, signal);
}
