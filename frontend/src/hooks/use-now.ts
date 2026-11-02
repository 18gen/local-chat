import * as React from "react"

// One shared clock, ticking each second while anything is subscribed, so
// only the countdowns re-render.
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

export function useNow() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
