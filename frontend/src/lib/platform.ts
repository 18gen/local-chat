/** True on macOS. Browser only: call it from UI rendered on the client. */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false
  const userAgentData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData
  return /mac/i.test(userAgentData?.platform ?? navigator.platform)
}
