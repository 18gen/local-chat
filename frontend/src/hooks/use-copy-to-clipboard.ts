import * as React from "react"

export type CopyState = "idle" | "copied" | "failed"

/**
 * Copies text to the clipboard and reports the result, returning to "idle"
 * after `resetMs`. The text itself is never logged.
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [state, setState] = React.useState<CopyState>("idle")
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  const copy = async (text: string) => {
    let next: CopyState = "copied"
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard access can be denied or unavailable (e.g. non-HTTPS origins).
      next = "failed"
    }
    setState(next)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setState("idle"), resetMs)
  }

  return { state, copy }
}
