/**
 * Resolves after `ms`, or rejects when `signal` aborts. Stands in for
 * network calls.
 */
export function mockDelay<T>(value: T, ms: number, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }
    const timer = setTimeout(() => resolve(value), ms)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true }
    )
  })
}
