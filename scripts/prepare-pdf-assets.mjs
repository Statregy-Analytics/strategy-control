import { cp, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = new URL('../', import.meta.url)
const source = new URL('node_modules/pdfjs-dist/', root)
const target = new URL('public/vendor/pdfjs/', root)
await mkdir(target, { recursive: true })
for (const name of ['cmaps', 'standard_fonts', 'wasm', 'iccs', 'LICENSE']) {
  await cp(fileURLToPath(new URL(name, source)), fileURLToPath(new URL(name, target)), {
    recursive: true,
  })
}
