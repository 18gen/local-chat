type Role = "user" | "assistant";

// In memory only; never persisted.
export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  /** Epoch ms; deleted once older than the TTL. */
  createdAt: number;
};
