// Retain the key after a failed/ambiguous response; retrying the same payload must
// not create a second financial operation. A successful response ends the action.
export function createIdempotentWriter(send, uuid = () => crypto.randomUUID()) {
  const pending = new Map()
  return async (method, path, payload) => {
    const fingerprint = JSON.stringify([method, path, payload ?? null])
    if (!pending.has(fingerprint)) pending.set(fingerprint, uuid())
    const result = await send(method, path, payload, pending.get(fingerprint))
    pending.delete(fingerprint)
    return result
  }
}
