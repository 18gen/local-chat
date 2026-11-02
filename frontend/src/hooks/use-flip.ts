import * as React from "react"

const DURATION_MS = 300
const EASING = "cubic-bezier(0.2, 0, 0, 1)"
const ANIMATION_ID = "flip"

type Snapshot = {
  rects: Map<string, DOMRect>
  focused: Element | null
}

function flipItems(container: HTMLElement) {
  return container.querySelectorAll<HTMLElement>("[data-flip-id]")
}

/**
 * Slides list items to their new place after a reorder (FLIP). Mark items
 * with `data-flip-id` and call `capture()` just before the change. Reduced
 * motion skips the animation.
 */
export function useFlip<T extends HTMLElement>() {
  const containerRef = React.useRef<T>(null)
  const snapshot = React.useRef<Snapshot | null>(null)

  const capture = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rects = new Map<string, DOMRect>()
    for (const item of flipItems(container)) {
      // Measured mid-animation too, so a quick second change starts from
      // where the item currently is.
      rects.set(item.dataset.flipId ?? "", item.getBoundingClientRect())
    }
    const focused = container.contains(document.activeElement)
      ? document.activeElement
      : null
    snapshot.current = { rects, focused }
  }, [])

  React.useLayoutEffect(() => {
    const first = snapshot.current
    const container = containerRef.current
    if (!first || !container) return
    snapshot.current = null

    // Moving a node in the DOM can drop focus; keep it on the pressed control.
    if (
      first.focused instanceof HTMLElement &&
      first.focused.isConnected &&
      document.activeElement !== first.focused
    ) {
      first.focused.focus({ preventScroll: true })
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    for (const item of flipItems(container)) {
      const before = first.rects.get(item.dataset.flipId ?? "")
      if (!before) continue
      item
        .getAnimations()
        .filter((animation) => animation.id === ANIMATION_ID)
        .forEach((animation) => animation.cancel())
      const after = item.getBoundingClientRect()
      const dx = before.left - after.left
      const dy = before.top - after.top
      if (dx === 0 && dy === 0) continue
      item.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        { id: ANIMATION_ID, duration: DURATION_MS, easing: EASING }
      )
    }
  })

  return { containerRef, capture }
}
