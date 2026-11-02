type Role = "user" | "assistant";

// Kept in memory only, by the chat screen. Nothing is persisted.
export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  /** Epoch milliseconds; the message is deleted once it's older than the TTL. */
  createdAt: number;
};
