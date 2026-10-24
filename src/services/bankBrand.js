// Catalogue bank code is authoritative; never infer a logo from a similar name.
const logos = {
  341: 'itau',
  237: 'bradesco',
  '077': 'inter',
  '033': 'santander',
  748: 'sicredi',
  336: 'c6',
}
export function bankLogo(code) {
  if (!/^\d{1,3}$/.test(String(code ?? ''))) return null
  const name = logos[String(code).padStart(3, '0')]
  return name ? `/icons/banks/${name}.png` : null
}
