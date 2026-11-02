import * as React from "react"

import { isMac } from "@/lib/platform"

// The OS doesn't change while the page is open.
function subscribe() {
  return () => {}
}

/**
 * Whether this is a Mac, or null on the server, which can't know: render no
 * hint then, so hydration matches and the hint appears right after.
 */
export function useIsMac(): boolean | null {
  return React.useSyncExternalStore(subscribe, isMac, () => null)
}
