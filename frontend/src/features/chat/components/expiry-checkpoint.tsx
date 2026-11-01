"use client";

import { Marker, MarkerContent } from "@/components/ui/marker";
import { useNow } from "@/hooks/use-now";
import { formatCountdown } from "@/features/chat/time-format";
import { t } from "@/locales";

// A text-only Checkpoint (shadcn's separator Marker) counting down to when
// the oldest message is deleted. A labeled separator needs no role; it is
// read as ordinary text, not announced on every tick.
export function ExpiryCheckpoint({ expiresAt }: { expiresAt: number }) {
  const now = useNow();

  return (
    <Marker variant="separator">
      <MarkerContent className="tabular-nums">
        {t.chat.expiryCheckpoint(formatCountdown(expiresAt - now))}
      </MarkerContent>
    </Marker>
  );
}
