export function isFullName(val) {
  try {
    if (!val) return false
    const parts = String(val).trim().split(/\s+/).filter(Boolean)
    return parts.length >= 2
  } catch {
    return false
  }
}

export default isFullName
