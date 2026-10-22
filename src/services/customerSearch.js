export function customerSearchParams(search, field = 'name', contact = '') {
  const term = String(search ?? '').trim()
  // Both existing search modes use the server's unified search; the independent
  // contact filter remains available for the name mode.
  return {
    search: term || undefined,
    contact: field === 'contact' ? undefined : String(contact ?? '').trim() || undefined,
  }
}
