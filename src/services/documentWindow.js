// Keep browser activation and pending-tab ownership independent of the UI.
export function createDocumentWindow() {
  let active = true,
    busy = false,
    pending = null
  async function open(loadUrl, { current = () => true, allowBlob = false } = {}) {
    if (!active || busy || !current()) return false
    busy = true
    let tab = null
    try {
      tab = window.open('', '_blank')
      if (!tab) throw Error('Permita a abertura de novas abas e tente novamente.')
      pending = tab
      tab.opener = null
      const meta = tab.document.createElement('meta')
      meta.name = 'referrer'
      meta.content = 'no-referrer'
      tab.document.head.appendChild(meta)
      const value = await loadUrl()
      if (!active || !current()) {
        tab.close()
        return false
      }
      let url
      try {
        url = new URL(value)
      } catch {
        throw Error('O documento não possui um endereço válido.')
      }
      if (
        url.protocol !== 'https:' &&
        !(url.protocol === 'http:' && url.origin === window.location.origin) &&
        !(allowBlob && url.protocol === 'blob:' && url.origin === window.location.origin)
      )
        throw Error('O documento não possui um endereço válido.')
      if (tab.closed) throw Error('Não foi possível abrir o documento.')
      const link = tab.document.createElement('a')
      link.href = url.href
      link.rel = 'noopener noreferrer'
      link.referrerPolicy = 'no-referrer'
      link.hidden = true
      tab.document.body.appendChild(link)
      link.click()
      pending = null
      return true
    } catch (error) {
      tab?.close()
      if (active && current()) throw error
      return false
    } finally {
      if (pending === tab) pending = null
      busy = false
    }
  }
  function dispose() {
    active = false
    pending?.close()
    pending = null
  }
  return { open, dispose }
}
