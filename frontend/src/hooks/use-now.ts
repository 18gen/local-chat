import * as React from "react"

// One shared clock that ticks on each second boundary while anything is
// subscribed. Only the small components that show a countdown use it, so
// the rest of the page doesn't re-render every second.
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  listeners.forEach((listener) => listener())
  timer = setTimeout(tick, 1000 - (Date.now() % 1000))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (timer === undefined) {
    timer = setTimeout(tick, 1000 - (Date.now() % 1000))
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearTimeout(timer)
      timer = undefined
    }
  }
}

// Rounded to the second so repeated reads within a tick return the same value.
function getSnapshot() {
  return Math.floor(Date.now() / 1000) * 1000
}

function getServerSnapshot() {
  return 0
}

/** The current time in epoch milliseconds, updated every second. */
export function useNow() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
