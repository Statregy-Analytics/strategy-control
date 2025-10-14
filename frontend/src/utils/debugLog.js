// Simple debug logging helper.
// Use VITE_DEBUG=true to enable global debug logs.
// Optionally pass a namespace to allow filtering later.
export function isDebug() {
  try {
    return !!(import.meta && import.meta.env && import.meta.env.VITE_DEBUG === 'true')
  } catch {
    return false
  }
}

export function debugLog(namespace, ...args) {
  try {
    if (!isDebug()) return
    if (namespace) console.log(`[${namespace}]`, ...args)
    else console.log(...args)
  } catch {
    // ignore logging errors in old runtimes
  }
}
