export function safePublicationLink(value) {
  try {
    const url = new URL(String(value).trim())
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}
export function publicationHeadings(blocks = []) {
  return blocks
    .filter((block) => ['h2', 'h3'].includes(block.type) && block.text?.trim())
    .map((block) => ({ id: block.id, level: block.type, text: block.text.trim() }))
}
