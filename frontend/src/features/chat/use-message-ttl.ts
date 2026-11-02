import { DEFAULT_TTL_MS, isTtlOption } from "@/features/chat/message-retention";
import { createStoredValue } from "@/lib/stored-value";

const messageTtl = createStoredValue("local-chat:message-ttl", DEFAULT_TTL_MS, (raw) => {
  const ttlMs = Number(raw);
  return isTtlOption(ttlMs) ? ttlMs : null;
});

export function useMessageTtl() {
  return { ttlMs: messageTtl.use(), setTtlMs: messageTtl.set };
}
