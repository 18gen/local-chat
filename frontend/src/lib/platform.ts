/**
 * True on macOS, for showing ⌘ instead of Ctrl in shortcut hints. Browser
 * only: call it from UI that renders on the client (e.g. tooltip content).
 */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false
  const userAgentData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData
  return /mac/i.test(userAgentData?.platform ?? navigator.platform)
}
