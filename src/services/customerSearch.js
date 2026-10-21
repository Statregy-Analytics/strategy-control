export function customerSearchParams(search, field = 'name', contact = '') {
  const term = String(search ?? '').trim()
  const byContact = field === 'contact' || term.includes('@')
  return {
    name: !byContact ? term || undefined : undefined,
    contact: byContact && term ? term : String(contact ?? '').trim() || undefined,
  }
}
