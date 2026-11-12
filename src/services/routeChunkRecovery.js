const retryKey = 'sa_route_chunk_retry'
const chunkFailure =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i

export function clearRouteChunkRetry(storage) {
  try {
    storage.removeItem(retryKey)
  } catch {
    /* Storage may be unavailable. */
  }
}

export function recoverRouteChunk(error, to, { resolve, storage, location, notify }) {
  if (
    !chunkFailure.test(String(error?.message || '')) ||
    !to?.matched?.some((record) => record.meta?.requiresAuth)
  )
    return false
  try {
    const target = new URL(resolve(to), location.origin)
    if (target.origin !== location.origin) return false
    if (storage.getItem(retryKey) === target.href) {
      notify()
      return false
    }
    storage.setItem(retryKey, target.href)
    location.assign(target.href)
    return true
  } catch {
    notify()
    return false
  }
}
