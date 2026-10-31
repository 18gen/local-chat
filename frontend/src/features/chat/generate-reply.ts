import type { ChatMessage } from "@/features/chat/types";
import { t } from "@/locales";

// Placeholder until the backend is connected. Replace the body with the API
// call; the rest of the app only depends on this signature. It receives the
// whole conversation, so the server doesn't need to store any chat history.
const MOCK_REPLY = t.chat.mockReply;
const MOCK_DELAY_MS = 800;

export function generateReply(
  _history: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(() => resolve(MOCK_REPLY), MOCK_DELAY_MS);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
