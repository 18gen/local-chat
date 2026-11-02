"use client";

import { Marker, MarkerContent } from "@/components/ui/marker";
import { useNow } from "@/hooks/use-now";
import { formatCountdown } from "@/features/chat/time-format";
import { t } from "@/locales";

// A labeled separator needs no role, so the countdown isn't announced on
// every tick.
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
